import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddlewareControl.js';
import {
   saveJob,
   getSavedJobs,
   deleteSavedJob,
   checkSavedJob
} from '../controllers/savedJobController.js';

const router = express.Router();

// Protect all routes with authentication and jobseeker role
router.use(authMiddleware);
router.use(roleMiddleware(['jobseeker']));

// Save and get saved jobs
router.route('/')
    .post(saveJob)
    .get(getSavedJobs);

// Check if a job is saved
router.get('/check/:jobId', checkSavedJob);

// Delete a saved job
router.delete('/:savedJobId', deleteSavedJob);

export default router; 