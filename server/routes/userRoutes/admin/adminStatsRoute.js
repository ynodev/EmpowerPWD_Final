import express from 'express';
import DashboardController from '../../../controllers/adminStatsController.js';
import { authMiddleware, roleMiddleware } from '../../../middleware/authMiddlewareControl.js';

const router = express.Router();

// Add logging middleware
const logRequest = (req, res, next) => {
  console.log('Admin Stats Route - Request Headers:', req.headers);
  console.log('Admin Stats Route - User:', req.user);
  next();
};

router.use(logRequest);

// Stats routes with auth checks
router.get('/stats', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  (req, res, next) => {
    console.log('Processing /stats request for user:', req.user);
    next();
  },
  DashboardController.getPlatformStats
);

router.get('/trends', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  DashboardController.getMonthlyTrends
);

router.get('/pending-jobs', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  DashboardController.getPendingJobs
);

router.get('/pending-users', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  DashboardController.getPendingUsers
);

export default router;
