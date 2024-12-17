import express from 'express';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import {
  getMessages,
  getConversations,
  markMessagesAsRead,
  getUnreadCount,
  sendMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Message routes
router.get('/messages/:userId', getMessages);
router.get('/conversations', getConversations);
router.post('/send', sendMessage);
router.put('/read/:senderId', markMessagesAsRead);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/:messageId', authMiddleware, updateMessage);

// Delete a message
router.delete('/:messageId', authMiddleware, deleteMessage);

export default router;