import ChatMessage from '../models/chats.js';
import { User, JobSeeker, Employer } from '../models/userModel.js';
import mongoose from 'mongoose';

// Helper function to check user authentication
const checkAuth = (req, res) => {
  if (!req.user || !req.user._id) {
    return {
      error: true,
      status: 401,
      message: 'User not authenticated'
    };
  }
  return { error: false };
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    console.log('Sending message:', {
      senderId,
      receiverId,
      message
    });

    if (!receiverId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'receiverId and message are required fields' 
      });
    }

    // Validate that receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
      isRead: false
    });

    await newMessage.save();

    // Populate sender and receiver details
    const populatedMessage = await ChatMessage.findById(newMessage._id)
      .populate('senderId', 'email role')
      .populate('receiverId', 'email role');

    console.log('Message saved:', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if both users exist
    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Get messages
    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    })
    .populate('senderId', 'email role')
    .populate('receiverId', 'email role')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get all conversations
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all messages involving current user
    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    })
    .populate('senderId', 'email role')
    .populate('receiverId', 'email role')
    .sort({ createdAt: -1 });

    // Group messages by conversation
    const conversationsMap = new Map();

    for (const msg of messages) {
      // Get partner ID
      const partnerId = msg.senderId._id.toString() === currentUserId.toString()
        ? msg.receiverId._id.toString()
        : msg.senderId._id.toString();

      if (!conversationsMap.has(partnerId)) {
        // Get partner details
        const partner = msg.senderId._id.toString() === currentUserId.toString()
          ? msg.receiverId
          : msg.senderId;

        // Get additional user info
        let partnerDetails = {
          _id: partner._id,
          email: partner.email,
          role: partner.role
        };

        // Get role-specific details
        if (partner.role === 'employer') {
          const employer = await Employer.findOne({ user: partner._id })
            .populate('companyInfo', 'companyName');
          if (employer?.companyInfo) {
            partnerDetails.companyName = employer.companyInfo.companyName;
          }
        } else {
          const jobseeker = await JobSeeker.findOne({ user: partner._id });
          if (jobseeker?.basicInfo) {
            partnerDetails.firstName = jobseeker.basicInfo.firstName;
            partnerDetails.lastName = jobseeker.basicInfo.lastName;
          }
        }

        conversationsMap.set(partnerId, {
          partner: partnerDetails,
          messages: [],
          lastMessage: msg,
          unreadCount: msg.receiverId._id.toString() === currentUserId.toString() && !msg.isRead ? 1 : 0
        });
      } else {
        const conv = conversationsMap.get(partnerId);
        conv.messages.push(msg);
        
        // Update unread count
        if (msg.receiverId._id.toString() === currentUserId.toString() && !msg.isRead) {
          conv.unreadCount++;
        }

        // Update last message if newer
        if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = msg;
        }
      }
    }

    // Convert to array and sort
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.status(200).json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;

    await ChatMessage.updateMany(
      {
        senderId: senderId,
        receiverId: currentUserId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Add this new controller function
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const count = await ChatMessage.countDocuments({
      receiverId: currentUserId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Add these controller methods
export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const messageDoc = await ChatMessage.findById(messageId);
    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the message
    if (messageDoc.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    messageDoc.message = message;
    messageDoc.edited = true;
    await messageDoc.save();

    res.status(200).json({
      success: true,
      data: messageDoc
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 