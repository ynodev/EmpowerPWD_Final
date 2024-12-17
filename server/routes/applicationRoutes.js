import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';

const router = express.Router();

// Update application status and create interview schedule
router.patch(
  '/applications/:applicationId/status',
  authMiddleware,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, startTime, endTime, date } = req.body;
      
      console.log('Updating application status:', { applicationId, status, startTime, endTime, date });
      
      // Verify user has permission to update this application
      const application = await Application.findOne({
        _id: applicationId,
        userId: req.user._id
      }).populate('jobId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or you do not have permission to update it'
        });
      }
      
      // Create interview schedule
      if (status === 'Interview Scheduled') {
        const interview = new Interview({
          applicationId: applicationId,
          jobSeekerId: req.user._id,
          employerId: application.jobId.employersId,
          startTime: startTime,
          endTime: endTime,
          date: date,
          status: 'scheduled'
        });
        
        await interview.save();
      }
      
      // Update the application status
      application.status = status;
      await application.save();
      
      res.json({
        success: true,
        message: 'Application status and interview schedule updated successfully',
        data: application
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: error.message
      });
    }
  }
);

// Add this route handler
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'hired', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
});

// Add cancel application route
router.put('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, additionalInfo } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellation: {
          reason,
          additionalInfo,
          date: new Date()
        }
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling application'
    });
  }
});

// Add this route to check application status
router.get('/check/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const application = await Application.findOne({
      jobseeker: userId,
      jobId: jobId
    });

    res.json({
      success: true,
      hasApplied: !!application
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking application status',
      error: error.message
    });
  }
});

export default router; 