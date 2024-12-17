import express from 'express';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import { getCurrentUser, getUserById } from '../controllers/userController.js';

const router = express.Router();
router.use(authMiddleware);

// Protected route - needs authentication
router.get('/current', authMiddleware, getCurrentUser);
router.get('/:userId', authMiddleware, getUserById);

export default router; 