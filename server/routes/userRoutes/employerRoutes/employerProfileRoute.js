
import express from 'express';
import EmployerProfile from '../../../controllers/employerProfile.js';
import { authMiddleware, roleMiddleware } from '../../../middleware/authMiddlewareControl.js';

const router = express.Router();

router.get(
  '/profile',
  authMiddleware,
  roleMiddleware(['employer']),
  EmployerProfile.getEmployerProfile
);

export default router;