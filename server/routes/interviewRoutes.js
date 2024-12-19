import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Interview from '../models/Interview.js';
import JobApplication from '../models/jobApplicationModel.js';
import mongoose from 'mongoose';
import { createNotification } from '../models/notification.js';
import {
  createInterview,
  getInterviewByApplication,
  getEmployerInterviews,
  getJobSeekerInterviews,
  updateInterview,
  deleteInterview,
  scheduleInterview,
  updateInterviewSchedule,
  cancelInterview,
  updateInterviewByApplication,
  rescheduleInterview,
  acceptApplicant,
  checkSlotAvailability,
  getScheduledInterviewsByEmployer,
  getBookedSlots
} from '../controllers/interviewController.js';

const router = express.Router();

// Create and manage interviews
router.post('/create', authMiddleware, createInterview);
router.get('/application/:applicationId', authMiddleware, getInterviewByApplication);
router.get('/employer/:employerId', authMiddleware, getEmployerInterviews);
router.get('/jobseeker/:jobseekerId', authMiddleware, getJobSeekerInterviews);
router.put('/:id', authMiddleware, updateInterview);
router.delete('/:id', authMiddleware, deleteInterview);
router.patch('/application/:applicationId', authMiddleware, updateInterviewByApplication);
// Add this new route for updating interview schedule
router.patch('/:id/schedule', authMiddleware, updateInterviewSchedule);

// Add these new routes
router.post(
  '/:interviewId/cancel',
  authMiddleware,
  async (req, res) => {
    try {
      console.log('Cancel route accessed:', {
        params: req.params,
        body: req.body
      });
      await cancelInterview(req, res);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.toString()
      });
    }
  }
);

router.post(
  '/:interviewId/reschedule',
  authMiddleware,
  async (req, res) => {
    try {
      console.log('Reschedule route accessed:', {
        params: req.params,
        body: req.body
      });
      await rescheduleInterview(req, res);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.toString()
      });
    }
  }
);

// Add logging middleware
router.use('/jobseeker/:jobseekerId', (req, res, next) => {
  console.log('Interview route accessed:', {
    params: req.params,
    query: req.query,
    path: req.path
  });
  next();
});

router.get('/jobseeker/:jobseekerId', getJobSeekerInterviews);

// Update the complete interview route
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { result, feedback, jobId, jobseekerId, applicationId } = req.body;

    console.log('Complete interview request:', {
      id,
      userId: req.user?.id,
      body: req.body
    });

    // Map the result to the correct enum value
    const resultMapping = {
      'accepted': 'hired',
      'rejected': 'rejected'
    };

    const mappedResult = resultMapping[result] || 'rejected';

    // Validate the interview exists
    const interview = await Interview.findOne({
      _id: id
    }).populate('applicationId');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview status and result
    interview.status = 'completed';
    interview.result = mappedResult;
    interview.feedback = feedback;
    interview.completedAt = new Date();

    await interview.save();

    // Update application status based on interview result
    if (interview.applicationId) {
      console.log('Updating application:', interview.applicationId);
      
      const applicationStatus = mappedResult === 'hired' ? 'hired' : 'rejected';
      
      const Application = mongoose.model('Application');
      
      const updatedApplication = await Application.findByIdAndUpdate(
        interview.applicationId,
        {
          $set: {
            status: applicationStatus,
            interviewFeedback: feedback,
            updatedAt: new Date(),
            interviewResult: mappedResult,
            completedAt: new Date()
          }
        },
        { new: true }
      );

      console.log('Updated application:', updatedApplication);
    }

    // Create notification
    try {
      await createNotification({
        userId: jobseekerId,
        type: 'system',
        title: `Interview Result Available`,
        message: `Your interview for the position has been completed. Please check your application status.`,
        metadata: {
          interviewId: id,
          jobId,
          result: mappedResult,
          applicationId: interview.applicationId,
          notificationType: 'interview_completed'
        }
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Interview completed and application updated successfully',
      data: {
        interview,
        applicationStatus: mappedResult === 'hired' ? 'hired' : 'rejected'
      }
    });

  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview and update application',
      error: error.message,
      details: error.errors
    });
  }
});

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, {
    params: req.params,
    body: req.body
  });
  next();
});

// Get all interviews for a jobseeker
router.get('/jobseeker/:userId', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching interviews for jobseeker:', req.params.userId);

    const interviews = await Interview.find({ jobseekerId: req.params.userId })
      .populate({
        path: 'employerId',
        model: 'User',
        select: '_id email'  // Just get the basic User info
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle jobLocation'
      })
      .populate('applicationId')
      .lean();

    console.log('After initial population:', JSON.stringify(interviews, null, 2));

    // Manually populate employer and company info
    const populatedInterviews = await Promise.all(interviews.map(async (interview) => {
      // Find the employer using User ID
      const employer = await mongoose.model('Employer').findOne({ 
        user: interview.employerId._id 
      }).populate('companyInfo');

      console.log('\nProcessing interview:', interview._id);
      console.log('Found employer:', employer);
      console.log('Company info:', employer?.companyInfo);

      return {
        ...interview,
        job: {
          title: interview.jobId?.jobTitle || 'N/A',
          location: interview.jobId?.jobLocation || 'N/A'
        },
        company: {
          name: employer?.companyInfo?.companyName || 'N/A'
        }
      };
    }));

    console.log('Final populated interviews:', JSON.stringify(populatedInterviews, null, 2));

    res.json({
      success: true,
      count: populatedInterviews.length,
      interviews: populatedInterviews
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      interviews: []
    });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result } = req.body;

    // Validate status and result
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    if (result && !['pending', 'hired', 'rejected'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result value'
      });
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { 
        status: status,
        result: result || 'pending'
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // If interview is completed, update the application status
    if (status === 'completed' && interview.applicationId) {
      await Application.findByIdAndUpdate(
        interview.applicationId,
        { status: result === 'hired' ? 'hired' : 'rejected' }
      );
    }

    res.json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating interview status'
    });
  }
});
// Schedule management
router.post('/:applicationId/schedule', authMiddleware, scheduleInterview);
router.put('/:id/schedule', authMiddleware, updateInterviewSchedule);
router.post('/:interviewId/cancel', authMiddleware, cancelInterview);
router.post('/:interviewId/reschedule', authMiddleware, rescheduleInterview);

// Add new route for accepting applicants
router.post('/:interviewId/accept', authMiddleware, acceptApplicant);

router.get('/check-slot', authMiddleware, checkSlotAvailability);

// Add this new route
router.get('/employer/:employerId/scheduled', authMiddleware, getScheduledInterviewsByEmployer);

// Add this new route
router.get('/slots/:employerId', authMiddleware, getBookedSlots);

export default router; 

