import express from 'express';
import multer from 'multer';
import { submitApplication, getApplicationDetails, updateApplicationStatus, getMyApplications, getApplicationById } from '../controllers/jobApplicationController.js';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/applications/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Routes
router.post('/submit', 
  authMiddleware,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ]),
  submitApplication
);

router.get('/:id/details', authMiddleware, getApplicationById);
router.patch('/status/:id', authMiddleware, updateApplicationStatus);
router.get('/my-applications', authMiddleware, getMyApplications);

// Update job posting
router.put('/employer/jobs/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.id; // Get from authenticated user

    // First check if the job belongs to this employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employersId.toString() !== employerId.toString()) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Job updated successfully',
      job: updatedJob 
    });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      message: 'Error updating job posting',
      error: error.message 
    });
  }
});

export default router; 