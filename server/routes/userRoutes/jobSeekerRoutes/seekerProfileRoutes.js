// routes/jobSeekerProfile.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware, roleMiddleware } from '../../../middleware/authMiddlewareControl.js';
import {
  getUserProfile,
  updateBasicInfo,
  updateLocationInfo,
  // Work Experience
  getWorkExperience,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getWorkExperienceById,
  // Education
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  // Skills
  getSkills,
  updateSkills,
  uploadDocument
} from '../../../controllers/seekerProfile.js';

// Import getJobSeekerApplications from jobApplicationController
import { getJobSeekerApplications } from '../../../controllers/jobApplicationController.js';

// Add this import at the top
import savedJobRoutes from '../../savedJobRoutes.js';

const router = express.Router();

// Add multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

// Add file filter for PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Profile routes
router.get('/profile', authMiddleware, roleMiddleware(['jobseeker']), getUserProfile);
router.put('/profile/basic-info', authMiddleware, roleMiddleware(['jobseeker']), updateBasicInfo);
router.put('/profile/location', authMiddleware, roleMiddleware(['jobseeker']), updateLocationInfo);

// Work Experience routes
router.get('/profile/work-experience', authMiddleware, roleMiddleware(['jobseeker']), getWorkExperience);
router.post('/profile/work-experience', authMiddleware, roleMiddleware(['jobseeker']), addWorkExperience);
router.put('/profile/work-experience/:id', authMiddleware, roleMiddleware(['jobseeker']), updateWorkExperience);
router.delete('/profile/work-experience/:id', authMiddleware, roleMiddleware(['jobseeker']), deleteWorkExperience);
router.get(
  '/profile/work-experience/:id',
  authMiddleware,
  roleMiddleware(['jobseeker']),
  getWorkExperienceById
);

// Education routes
router.get('/profile/education', authMiddleware, roleMiddleware(['jobseeker']), getEducation);
router.post('/profile/education', authMiddleware, roleMiddleware(['jobseeker']), addEducation);
router.put('/profile/education/:id', authMiddleware, roleMiddleware(['jobseeker']), updateEducation);
router.delete('/profile/education/:id', authMiddleware, roleMiddleware(['jobseeker']), deleteEducation);

// Skills routes
router.get('/profile/skills', authMiddleware, roleMiddleware(['jobseeker']), getSkills);
router.put('/profile/skills', authMiddleware, roleMiddleware(['jobseeker']), updateSkills);

// Add this route for file uploads
router.post(
  '/profile/upload/:type',
  authMiddleware,
  roleMiddleware(['jobseeker']),
  upload.single('file'),
  uploadDocument
);

// Add this route for getting user's applications
router.get('/applications', authMiddleware, roleMiddleware(['jobseeker']), getJobSeekerApplications);

// Add this after your existing routes
router.use('/saved-jobs', savedJobRoutes);

export default router;