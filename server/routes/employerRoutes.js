import express from 'express';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import * as employerController from '../controllers/employerController.js';

const router = express.Router();

// Add this route for password change
router.put('/:userId/change-password', authMiddleware, employerController.changePassword);



// ... other routes ...

export default router; 