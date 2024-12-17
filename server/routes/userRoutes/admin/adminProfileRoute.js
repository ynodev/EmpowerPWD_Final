import express from 'express';
import AdminProfile from '../../../controllers/adminProfile.js';
import { authMiddleware, roleMiddleware } from '../../../middleware/authMiddlewareControl.js';

const router = express.Router();

// Route to get admin profile
router.get(
  '/profile',
  authMiddleware,
  roleMiddleware(['admin']),
  AdminProfile.getAdminProfile
);

// Route to get all users (job seekers and employers) - Admin only
router.get(
  '/users',
  authMiddleware,
  roleMiddleware(['admin']),
  AdminProfile.getAllUsers
);

export default router;
