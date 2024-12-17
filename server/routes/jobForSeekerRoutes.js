import express from 'express';
import { getAllJobs, getJobById, incrementJobView, incrementJobClick, incrementJobApplication } from '../controllers/jobForSeekerController.js';

const router = express.Router();

router.get('/jobs/jobseeker/all', getAllJobs);
router.get('/jobs/jobseeker/:jobId', getJobById);
router.post('/:jobId/view', incrementJobView);
router.post('/:jobId/click', incrementJobClick);
router.post('/:jobId/application', incrementJobApplication);

export default router;