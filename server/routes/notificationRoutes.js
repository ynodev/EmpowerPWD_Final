import express from 'express';
import { 
    getNotifications,
    markAsRead,
    createNotification,
    deleteNotification,
    markAllAsRead,
    getUnreadCount
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all notifications for current user
router.get('/', getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Create new notification
router.post('/', createNotification);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

export default router; 