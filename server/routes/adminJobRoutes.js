import express from 'express';
import { getAllJobs, reviewJob, updateJobStatus, getJobStats } from '../controllers/adminController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddlewareControl.js';

const router = express.Router();

// Apply middleware
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Routes
router.get('/jobs', getAllJobs);
router.get('/jobs/:jobId', reviewJob);
router.patch('/jobs/:jobId/status', updateJobStatus);
router.get('/stats', getJobStats);

export default router; 