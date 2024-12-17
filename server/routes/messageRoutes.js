import express from 'express';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

// Get all conversations
router.get('/conversations', authMiddleware, getConversations);

// Get messages with specific user
router.get('/messages/:userId', authMiddleware, getMessages);

// Send a message
router.post('/send', authMiddleware, sendMessage);

// Edit a message
router.put('/messages/:messageId', authMiddleware, updateMessage);

// Delete a message
router.delete('/messages/:messageId', authMiddleware, deleteMessage);

// Add this route to your message routes
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Message.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread message count',
      error: error.message
    });
  }
});

// Add default export
export default router;