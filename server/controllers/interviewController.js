import Interview from '../models/Interview.js';
import Application from '../models/jobApplicationModel.js';
import mongoose from 'mongoose';
import { JobSeeker, BasicInfo, User } from '../models/userModel.js';
import { createNotification } from '../models/notification.js';
import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await fetch('https://api.infobip.com/sms/1/text/single', {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: "JobPortal",
        to: phoneNumber,
        text: message
      })
    });
    return response;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { startTime, endTime, date } = req.body;
    
    console.log('Received request:', { applicationId, startTime, endTime, date });
    
    // Find the application and verify permissions using JobApplication model
    const application = await JobApplication.findOne({
      _id: applicationId
    }).populate({
      path: 'jobId',
      populate: {
        path: 'employersId'
      }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Found application:', application);

    // Check if slot is available
    const isAvailable = await Interview.isSlotAvailable(
      date,
      startTime,
      endTime,
      req.user._id // assuming this is the employer's ID
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create new interview
    const interview = new Interview({
      applicationId: applicationId,
      jobSeekerId: application.userId,
      employerId: application.jobId.employersId._id,
      startTime: startTime,
      endTime: endTime,
      date: new Date(date),
      status: 'scheduled',
      timeSlot: {
        date: new Date(date),
        startTime,
        endTime,
        isBooked: true
      }
    });
    
    console.log('Creating interview:', interview);
    
    await interview.save();

    // Update application status
    application.status = 'Interview Scheduled';
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
}; 

export const getInterviewByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log('Fetching interview for application:', applicationId);

    const interview = await Interview.findOne({ applicationId })
      .populate('jobId', 'jobTitle jobLocation')
      .populate({
        path: 'employerId',
        select: 'companyName'
      })
      .lean();

    console.log('Found interview:', interview);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'No interview found for this application'
      });
    }

    return res.status(200).json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interview details',
      error: error.message
    });
  }
};

export const getEmployerInterviews = async (req, res) => {
  try {
    const { employerId } = req.params;
    
    // Get all interviews for this employer with populated fields
    const interviews = await Interview.find({
      employerId,
      status: { $ne: 'cancelled' }
    })
    .populate('jobseekerId')
    .populate('jobId')
    .populate({
      path: 'applicationId',
      populate: {
        path: 'jobId',
        select: 'jobTitle location company'
      }
    })
    .sort({ dateTime: 1 });

    // Transform and send the data
    const transformedInterviews = interviews.map(interview => ({
      _id: interview._id,
      dateTime: interview.dateTime,
      startTime: interview.startTime,
      endTime: interview.endTime,
      status: interview.status,
      jobseekerId: interview.jobseekerId,
      jobseeker: {
        name: interview.jobseekerId?.name || 'N/A',
        email: interview.jobseekerId?.email || 'N/A'
      },
      jobId: interview.jobId,
      job: interview.jobId,
      applicationId: interview.applicationId,
      meetingLink: interview.meetingLink,
      notes: interview.notes,
      result: interview.result,
      feedback: interview.feedback,
      cancellation: interview.cancellation,
      rescheduledFrom: interview.rescheduledFrom
    }));

    res.status(200).json({
      success: true,
      interviews: transformedInterviews
    });

  } catch (error) {
    console.error('Error fetching employer interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
};

export const getJobSeekerInterviews = async (req, res) => {
  try {
    const { jobseekerId } = req.params;
    console.log('Received jobseekerId:', jobseekerId);

    const interviews = await Interview.find({ jobseekerId })
    .populate({
      path: 'employerId',
      populate: {
        path: 'companyInfo',
        model: 'CompanyInfo'  // Make sure this matches your model name
      }
    })      .populate('jobId', 'jobTitle jobLocation')
      .lean();

    console.log('Found interviews:', interviews);

    const transformedInterviews = interviews.map(interview => ({
      _id: interview._id,
      dateTime: interview.dateTime,
      startTime: interview.startTime,
      endTime: interview.endTime,
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || '',
      status: interview.status || 'scheduled',
      job: {
        _id: interview.jobId?._id,
        title: interview.jobId?.jobTitle || 'N/A',
        location: interview.jobId?.jobLocation || 'N/A'
      },
      company: {
        name: interview.employerId?.companyInfo?.companyName || 'N/A'
      }
    }));

    return res.status(200).json({
      success: true,
      count: transformedInterviews.length,
      interviews: transformedInterviews
    });

  } catch (error) {
    console.error('Error in getJobSeekerInterviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
};

export const createInterview = async (req, res) => {
  try {
    console.log('Received interview creation request:', req.body);
    
    const { 
      applicationId, 
      jobseekerId, 
      employerId, 
      jobId,
      meetingLink, 
      notes 
    } = req.body;

    // Validate required fields
    if (!applicationId || !jobseekerId || !employerId || !jobId) {
      console.error('Missing required fields:', { 
        hasApplicationId: !!applicationId,
        hasJobseekerId: !!jobseekerId,
        hasEmployerId: !!employerId,
        hasJobId: !!jobId
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new interview with null times and pending status
    const interview = new Interview({
      applicationId,
      jobseekerId,
      employerId,
      jobId,
      dateTime: null,
      startTime: null,
      endTime: null,
      meetingLink,
      notes,
      status: 'pending'
    });

    console.log('Saving interview:', interview);
    await interview.save();
    console.log('Interview saved successfully');

    // Update application status
    await JobApplication.findByIdAndUpdate(
      applicationId,
      { status: 'Interview Pending' }
    );

    // Create notification
    await createNotification({
      userId: jobseekerId,
      title: 'Application Accepted',
      message: `Your application has been accepted. You can now schedule your interview time.`,
      type: 'system',
      metadata: {
        interviewId: interview._id,
        jobId,
        applicationId,
        notificationType: 'applications'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      data: interview
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create interview'
    });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Find and delete the interview
    const interview = await Interview.findByIdAndDelete(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update the associated application status
    await JobApplication.findByIdAndUpdate(
      interview.applicationId,
      { status: 'Under Review' } // Reset to previous status or choose appropriate status
    );

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
      error: error.message
    });
  }
};

export const updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { startTime, endTime, date, meetingLink, notes, status, result } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview fields
    if (startTime) interview.startTime = startTime;
    if (endTime) interview.endTime = endTime;
    if (date) interview.date = new Date(date);
    if (meetingLink) interview.meetingLink = meetingLink;
    if (notes) interview.notes = notes;
    if (status) interview.status = status;
    if (result) interview.result = result;

    await interview.save();

    // If status is changed to 'completed' and result is 'accepted'
    if (status === 'completed' && result === 'accepted') {
      // Update application status
      await Application.findByIdAndUpdate(
        interview.applicationId,
        { status: 'accepted' }
      );

      // Update job's hired applicants
      const job = await Job.findById(interview.jobId);
      if (job) {
        job.hiredApplicants.push({
          applicationId: interview.applicationId,
          jobseekerId: interview.jobseekerId,
          hiredDate: new Date()
        });
        await job.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
};

export const updateInterviewByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { dateTime, startTime, endTime } = req.body;
    
    console.log('Received schedule update:', { applicationId, dateTime, startTime, endTime });

    // First update the application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status: 'scheduled' },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Then find or create/update the interview
    let interview = await Interview.findOne({ applicationId });
    
    if (!interview) {
      interview = new Interview({
        applicationId,
        dateTime: new Date(dateTime),
        startTime,
        endTime,
        status: 'scheduled'
      });
    } else {
      interview.dateTime = new Date(dateTime);
      interview.startTime = startTime;
      interview.endTime = endTime;
      interview.status = 'scheduled';
    }

    await interview.save();
    console.log('Updated interview and application:', {
      interview,
      application: updatedApplication
    });

    return res.status(200).json({
      success: true,
      message: 'Interview schedule and application status updated successfully',
      data: {
        interview,
        application: updatedApplication
      }
    });

  } catch (error) {
    console.error('Error in updateInterviewByApplication:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
};

export const updateInterviewSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime, startTime, endTime, status } = req.body;

    console.log('Updating interview schedule:', {
      id,
      dateTime,
      startTime,
      endTime,
      status
    });

    // Validate the interview exists
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Create a new Date object from the dateTime
    const scheduledDate = new Date(dateTime);
    
    // Update the interview
    interview.dateTime = scheduledDate;
    interview.startTime = startTime;
    interview.endTime = endTime;
    interview.status = status || 'scheduled';

    await interview.save();

    console.log('Interview updated successfully:', interview);

    return res.status(200).json({
      success: true,
      message: 'Interview schedule updated successfully',
      data: interview
    });

  } catch (error) {
    console.error('Error updating interview schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update interview schedule',
      error: error.message
    });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { reason, additionalInfo } = req.body;

    console.log('Cancel interview request:', {
      interviewId,
      reason,
      additionalInfo,
      user: req.user
    });

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(interviewId)
      .populate('jobseekerId', 'email')
      .populate('employerId', 'email')
      .populate('jobId', 'title')
      .populate('applicationId');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview status
    interview.status = 'cancelled';
    interview.cancellation = {
      reason,
      additionalInfo,
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };

    await interview.save();

    // Create notifications with rescheduling information
    const jobseekerNotification = {
      title: 'Interview Cancelled',
      message: `Interview for ${interview.jobId.title} has been cancelled. Reason: ${reason}. Please wait for a new interview schedule.`,
      type: 'interview',
      metadata: {
        interviewId: interview._id,
        jobId: interview.jobId._id,
        reason,
        additionalInfo,
        applicationId: interview.applicationId._id,
        requiresReschedule: true
      }
    };

    const employerNotification = {
      title: 'Interview Cancelled - Action Required',
      message: `Interview for ${interview.jobId.title} has been cancelled. Please reschedule the interview with the candidate.`,
      type: 'interview',
      metadata: {
        interviewId: interview._id,
        jobId: interview.jobId._id,
        reason,
        additionalInfo,
        applicationId: interview.applicationId._id,
        requiresReschedule: true
      }
    };

    // Notify both parties
    await Promise.all([
      createNotification({
        userId: interview.jobseekerId._id,
        ...jobseekerNotification
      }),
      createNotification({
        userId: interview.employerId._id,
        ...employerNotification
      })
    ]);

    // Update application status
    await JobApplication.findByIdAndUpdate(
      interview.applicationId._id,
      { 
        status: 'Interview Cancelled - Pending Reschedule',
        lastUpdated: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully. Please reschedule the interview.',
      requiresReschedule: true
    });

  } catch (error) {
    console.error('Error in cancelInterview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel interview',
      error: error.toString()
    });
  }
};

export const rescheduleInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { dateTime, startTime, endTime } = req.body;

    console.log('Reschedule interview request:', {
      interviewId,
      dateTime,
      startTime,
      endTime,
      user: req.user
    });

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(interviewId)
      .populate('jobseekerId', 'email')
      .populate('employerId', 'email')
      .populate('jobId', 'title');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Store previous schedule
    const previousSchedule = {
      date: interview.dateTime,
      startTime: interview.startTime,
      endTime: interview.endTime
    };

    // Update interview schedule
    interview.dateTime = new Date(dateTime);
    interview.startTime = startTime;
    interview.endTime = endTime;
    interview.status = 'rescheduled';
    interview.rescheduledFrom = previousSchedule;

    await interview.save();

    // Create notifications
    const notificationContent = {
      title: 'Interview Rescheduled',
      message: `Interview for ${interview.jobId.title} has been rescheduled to ${new Date(dateTime).toLocaleDateString()} at ${startTime}`,
      type: 'interview',
      metadata: {
        interviewId: interview._id,
        jobId: interview.jobId._id,
        newDateTime: dateTime,
        newStartTime: startTime,
        newEndTime: endTime
      }
    };

    // Notify both parties
    await Promise.all([
      createNotification({
        userId: interview.jobseekerId._id,
        ...notificationContent
      }),
      createNotification({
        userId: interview.employerId._id,
        ...notificationContent
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: interview
    });

  } catch (error) {
    console.error('Error in rescheduleInterview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reschedule interview',
      error: error.toString()
    });
  }
};

export const acceptApplicant = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { feedback } = req.body;
    
    // Find the interview and populate necessary fields
    const interview = await Interview.findById(interviewId)
      .populate({
        path: 'applicationId',
        populate: {
          path: 'jobId'
        }
      })
      .populate('jobseekerId');
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview status with the correct enum value
    interview.status = 'completed';
    interview.result = 'hired';  // Use 'hired' instead of 'accepted'
    interview.feedback = feedback;
    await interview.save();

    // Update application status
    const application = await Application.findByIdAndUpdate(
      interview.applicationId._id,
      { status: 'accepted' },
      { new: true }
    );

    if (!application) {
      throw new Error('Application not found');
    }

    // Get the job ID from the application
    const jobId = application.jobId;
    
    // Update job's hired applicants
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check if applicant is already hired
    const isAlreadyHired = job.hiredApplicants.some(
      hire => hire.applicationId.toString() === application._id.toString()
    );

    if (!isAlreadyHired) {
      // Add to hired applicants array
      job.hiredApplicants.push({
        applicationId: application._id,
        jobseekerId: interview.jobseekerId._id,
        hiredDate: new Date()
      });

      await job.save(); // This will trigger the pre-save middleware to update vacancies
    }

    // Create notification for the job seeker
    await createNotification({
      userId: interview.jobseekerId._id,
      title: 'Application Accepted',
      message: `Congratulations! Your application for ${job.jobTitle} has been accepted.`,
      type: 'application',
      metadata: {
        jobId: job._id,
        applicationId: application._id,
        interviewId: interview._id,
        status: 'accepted'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Applicant successfully accepted',
      data: {
        interview,
        application,
        job
      }
    });

  } catch (error) {
    console.error('Error accepting applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept applicant',
      error: error.message
    });
  }
};

export const checkSlotAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, employerId } = req.query;
    
    const isAvailable = await Interview.isSlotAvailable(date, startTime, endTime, employerId);
    
    res.status(200).json({
      success: true,
      isAvailable
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking slot availability',
      error: error.message
    });
  }
};

export const getScheduledInterviewsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;

    const interviews = await Interview.find({
      employerId: employerId,
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('applicationId jobId');

    return res.status(200).json({
      success: true,
      data: interviews.map(interview => ({
        dateTime: interview.dateTime,
        startTime: interview.startTime,
        endTime: interview.endTime,
        status: interview.status,
        applicationId: interview.applicationId?._id,
        jobId: interview.jobId?._id
      }))
    });
  } catch (error) {
    console.error('Error fetching scheduled interviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled interviews'
    });
  }
};

export const getBookedSlots = async (req, res) => {
  try {
    const { employerId } = req.params;

    // Find all active interviews (not cancelled) for this employer
    const interviews = await Interview.find({
      employerId: employerId,
      status: { $nin: ['cancelled'] },
      dateTime: { $exists: true },
      startTime: { $exists: true },
      endTime: { $exists: true }
    }).select('dateTime startTime endTime');

    // Transform the data into a more usable format
    const bookedSlots = interviews.map(interview => ({
      date: new Date(interview.dateTime).toISOString().split('T')[0],
      startTime: interview.startTime,
      endTime: interview.endTime
    }));

    return res.status(200).json({
      success: true,
      data: bookedSlots
    });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booked slots'
    });
  }
};
