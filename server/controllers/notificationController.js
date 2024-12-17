import Notification from '../models/notification.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, message, type, title } = req.body;
    
    const notification = new Notification({
      userId,
      message,
      type,
      title,
      createdAt: new Date(),
      read: false
    });
    
    await notification.save();
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    // Get userId from query parameter instead of req.user
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }
    
    console.log('Fetching notifications for user:', userId);
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('Found notifications:', notifications);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      userId,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};
  