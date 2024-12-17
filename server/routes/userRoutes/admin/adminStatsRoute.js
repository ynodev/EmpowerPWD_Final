import express from 'express';
import DashboardController from '../../../controllers/adminStatsController.js';
import { authMiddleware, roleMiddleware } from '../../../middleware/authMiddlewareControl.js';


const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware(['admin']), DashboardController.getPlatformStats);
router.get('/trends', authMiddleware, roleMiddleware(['admin']), DashboardController.getMonthlyTrends);
router.get('/pending-jobs', authMiddleware, roleMiddleware(['admin']), DashboardController.getPendingJobs);
router.get('/pending-users',  authMiddleware, roleMiddleware(['admin']), DashboardController.getPendingUsers);

router.get('/activity', authMiddleware, roleMiddleware(['admin']), DashboardController.getRecentActivity);
router.patch('/jobs/:jobId/status', authMiddleware, roleMiddleware(['admin']), DashboardController.updateJobStatus);

export default router;
