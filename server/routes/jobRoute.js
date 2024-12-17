import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddlewareControl.js';
import Job from '../models/job.js';
import { Employer } from '../models/userModel.js';
import {
  createJob,
  getEmployerJobs,
  getJobById,
  updateJob,
  updateJobStarStatus,
  updateJobStatus,
  deleteJob,
  deleteMultipleJobs,
  getJobApplications,
  searchJobs,
} from '../controllers/jobController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Public routes (accessible to all authenticated users)
router.get('/search', searchJobs);
router.get('/:jobId', async (req, res) => {
  try {
    // First get the job with employersId
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find the employer where user matches the job's employersId
    const employer = await Employer.findOne({ user: job.employersId })
      .populate({
        path: 'companyInfo',
        select: '-__v'
      })
      .populate({
        path: 'contactPerson',
        select: '-__v'
      })
      .populate({
        path: 'pwdSupport',
        select: '-__v'
      });

    // Debug logs
    console.log('Found employer:', {
      companyInfo: employer?.companyInfo,
      contactPerson: employer?.contactPerson,
      pwdSupport: employer?.pwdSupport
    });

    // Add the employer data to the job object
    const jobWithEmployer = {
      ...job.toObject(),
      employer: {
        companyInfo: employer?.companyInfo || {},
        contactPerson: employer?.contactPerson || {},
        pwdSupport: employer?.pwdSupport || {}
      }
    };

    console.log('Company Info Fields:', Object.keys(employer?.companyInfo || {}));

    res.json(jobWithEmployer);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: error.message });
  }
});

// Employer and Admin routes
router.use(roleMiddleware(['employer', 'admin']));
router.delete('/:jobId', deleteJob);

// Job CRUD operations
router.post('/create', createJob);
router.get('/employer/:employerId', getEmployerJobs);
router.get('/applications/:jobId', getJobApplications);

// Edit-related routes
router.patch('/:jobId/update', updateJob);
router.patch('/:jobId/status', updateJobStatus);
router.patch('/:jobId/star', updateJobStarStatus);

// Update the edit route
router.put('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    // Find and update the job without checking ownership
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update the job
    Object.assign(job, updates);
    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

// Add this route to your jobRoute.js
router.patch('/:jobId/hire', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applicationId, jobseekerId, hiredDate } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Add to hired applicants array
    job.hiredApplicants.push({
      applicationId,
      jobseekerId,
      hiredDate: hiredDate || new Date()
    });

    // This will trigger the pre-save middleware that updates remainingVacancies
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Hired applicant added successfully',
      data: job
    });

  } catch (error) {
    console.error('Error updating hired applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hired applicants',
      error: error.message
    });
  }
});

// Admin-only routes
router.use(roleMiddleware(['admin']));

router.delete('/bulk-delete', deleteMultipleJobs);

export default router;