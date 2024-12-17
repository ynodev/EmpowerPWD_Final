import express from 'express';
import { createRoom } from '../controllers/dailyController.js';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';

const router = express.Router();

router.post('/create-room', authMiddleware, createRoom);

export default router; 
