import express from 'express';
import { getJobSeekerProfileForEmployer } from '../controllers/seekerProfile.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Route for employers to view job seeker profiles
router.get('/jobseeker/:seekerId', authMiddleware, roleMiddleware(['employer']), getJobSeekerProfileForEmployer);

export default router; 