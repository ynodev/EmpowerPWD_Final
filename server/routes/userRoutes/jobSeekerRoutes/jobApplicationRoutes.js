import express from 'express';
import { 
    submitApplication,
    getEmployerApplications,   // Changed from getJobApplicationsForEmployer
    getJobSeekerApplications,  // Changed from getJobApplications
    getApplicationById,
    updateApplicationStatus,
    cancelApplication
} from '../../../controllers/jobApplicationController.js';
import { 
    authMiddleware, 
    roleMiddleware 
} from '../../../middleware/authMiddlewareControl.js'; // Fixed casing in path
import Application from '../../../models/jobApplicationModel.js';

const router = express.Router();

// Submit new application (for job seekers)
router.post(
    '/submit', 
    authMiddleware, 
    roleMiddleware(['jobseeker']), 
    submitApplication
);

// Get all applications for the authenticated job seeker
router.get(
    '/jobseeker/applications',
    authMiddleware,
    roleMiddleware(['jobseeker']),
    getJobSeekerApplications
);

// Get all applications for jobs created by the authenticated employer
router.get(
    '/employer/:id/applications', 
    authMiddleware, 
    roleMiddleware(['employer']), 
    getEmployerApplications  // Updated function name
);

// Get specific application details
router.get(
    '/:id/details',
    authMiddleware,
    roleMiddleware(['employer', 'jobseeker']),
    getApplicationById
);

// Update application status
router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware(['employer']),
    updateApplicationStatus
);

// Get applications for the authenticated jobseeker
router.get(
  '/my-applications',
  authMiddleware,
  roleMiddleware(['jobseeker']),
  async (req, res) => {
    try {
      const jobseekerId = req.user.profile._id;
      
      const applications = await Application.find({ jobseeker: jobseekerId })
        .populate({
          path: 'jobId',
          populate: {
            path: 'employersId',
            populate: {
              path: 'companyInfo'
            }
          }
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
  }
);

// Update the cancel route to use the controller
router.put(
  '/cancel/:id', 
  authMiddleware, 
  roleMiddleware(['jobseeker']), 
  cancelApplication
);

export default router;


