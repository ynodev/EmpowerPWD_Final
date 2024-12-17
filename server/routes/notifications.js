import express from 'express';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import { 
  getNotifications,
  markNotificationAsRead,
  deleteNotification 
} from '../controllers/notificationController.js';

const router = express.Router();

// Get notifications for authenticated user
router.get('/', authMiddleware, getNotifications);

// Mark notification as read
router.patch('/:id/read', authMiddleware, markNotificationAsRead);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotification);

export default router; 