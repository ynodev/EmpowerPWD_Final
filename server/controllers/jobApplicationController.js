import Application from '../models/jobApplicationModel.js';
import { sendSMS } from '../services/smsService.js';
import multer from 'multer';
import path from 'path';
import { User, Employer } from '../models/userModel.js';
import { handleJobSeekerDocuments } from '../utils/documentHandler.js';
import Job from '../models/job.js';
import mongoose from 'mongoose';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/applications/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
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

// Submit new application
export const submitApplication = async (req, res) => {
  try {
    // Extensive logging
    console.log('Received Raw Application Data:', JSON.stringify(req.body, null, 2));

    // Destructure with explicit null checks
    const { 
      jobId, 
      basicInfo = {}, 
      workHistory = [], 
      jobPreferences = {}, 
      questionnaireAnswers = [],
      documents = {} 
    } = req.body || {};

    // Validate critical fields
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Create new application with comprehensive default values
    const newApplication = new Application({
      jobId,
      jobseeker: req.user._id,
      applicationData: {
        basicInfo: {
          firstName: basicInfo.firstName || '',
          lastName: basicInfo.lastName || '',
          email: basicInfo.email || '',
          phoneNumber: basicInfo.phoneNumber || '',
          address: basicInfo.address || '',
          city: basicInfo.city || '',
          province: basicInfo.province || '',
          country: basicInfo.country || '',
          postalCode: basicInfo.postalCode || ''
        },
        workHistory: Array.isArray(workHistory) ? workHistory : [],
        jobPreferences: {
          availability: jobPreferences.availability || '',
          preferredStartDate: jobPreferences.preferredStartDate || null,
          accommodation: {
            required: jobPreferences.accommodation?.required || false,
            details: jobPreferences.accommodation?.details || '',
            types: {
              mobilityAccess: jobPreferences.accommodation?.types?.mobilityAccess || false,
              visualAids: jobPreferences.accommodation?.types?.visualAids || false,
              hearingAids: jobPreferences.accommodation?.types?.hearingAids || false,
              flexibleSchedule: jobPreferences.accommodation?.types?.flexibleSchedule || false
            }
          }
        },
        questionnaireAnswers: Array.isArray(questionnaireAnswers) ? questionnaireAnswers : []
      },
      documents: {
        resumeUrl: documents.resumeUrl ? {
          path: documents.resumeUrl.path || null,
          originalName: documents.resumeUrl.originalName || null,
          mimeType: documents.resumeUrl.mimeType || null
        } : null,
        coverLetterUrl: documents.coverLetterUrl ? {
          path: documents.coverLetterUrl.path || null,
          originalName: documents.coverLetterUrl.originalName || null,
          mimeType: documents.coverLetterUrl.mimeType || null
        } : null
      },
      status: 'pending'
    });

    const savedApplication = await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: savedApplication
    });
  } catch (error) {
    console.error('Application Submission Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Middleware for file upload
export const uploadApplicationDocuments = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 5 }
]);

// Get application details
export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('jobseeker')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application details',
      error: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, meetingLink } = req.body;

    console.log('Updating application status:', { id, status, message, meetingLink });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(id)
      .populate('jobseeker')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status
    application.status = status.toLowerCase();
    await application.save();

    // Send SMS notification based on status
    try {
      let smsMessage = '';
      switch (status.toLowerCase()) {
        case 'accepted':
          smsMessage = `Congratulations! Your application for ${application.jobId.jobTitle} has been accepted.${
            meetingLink ? `\n\nYour interview meeting link: ${meetingLink}` : ''
          }${message ? `\n\nAdditional notes: ${message}` : ''}`;
          break;
        case 'rejected':
          smsMessage = `Thank you for your interest. Unfortunately, your application for ${application.jobId.jobTitle} was not successful at this time. ${message || ''}`;
          break;
        case 'interview scheduled':
          smsMessage = `Your interview for ${application.jobId.jobTitle} has been scheduled.${
            meetingLink ? `\n\nMeeting link: ${meetingLink}` : ''
          }${message ? `\n\nAdditional notes: ${message}` : ''}`;
          break;
        default:
          smsMessage = `Your application status has been updated to ${status}. ${message || ''}`;
      }

      const phoneNumber = formatPhoneNumberForSMS(application.basicInfo.phoneNumber);
      await sendSMS(phoneNumber, smsMessage);
    } catch (smsError) {
      console.error('SMS notification failed:', smsError);
      // Continue even if SMS fails
    }

    console.log('Application status updated successfully:', application);

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// Get applications for employer
export const getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user._id;
    
    const jobs = await Job.find({ employersId: employerId });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobseeker')
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching employer applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get applications for jobseeker
export const getJobSeekerApplications = async (req, res) => {
  try {
    const jobseekerId = req.user._id;

    // First get all applications with job info
    const applications = await Application.find({ jobseeker: jobseekerId })
      .populate('jobId')
      .sort({ createdAt: -1 });

    // Format the applications data with employer info
    const formattedApplications = await Promise.all(applications.map(async app => {
      // Find the employer directly using the employersId from the job
      const employer = await Employer.findOne({ user: app.jobId.employersId })
        .populate('companyInfo');

      console.log('Found employer:', {
        employerId: app.jobId.employersId,
        employer: employer,
        companyInfo: employer?.companyInfo
      });

      return {
        _id: app._id,
        status: app.status,
        createdAt: app.createdAt,
        jobId: {
          _id: app.jobId._id,
          jobTitle: app.jobId.jobTitle,
          jobLocation: app.jobId.jobLocation,
          employmentType: app.jobId.employmentType,
          salaryMin: app.jobId.salaryMin,
          salaryMax: app.jobId.salaryMax,
          employersId: app.jobId.employersId,
          company: employer?.companyInfo ? {
            name: employer.companyInfo.companyName || 'Company Name Not Available',
            logo: employer.companyInfo.companyLogo,
            website: employer.companyInfo.website || '',
            description: employer.companyInfo.companyDescription || '',
            industry: employer.companyInfo.industry || []
          } : null
        },
        basicInfo: app.applicationData?.basicInfo,
        workHistory: app.applicationData?.workHistory,
        jobPreferences: app.applicationData?.jobPreferences,
        documents: app.documents
      };
    }));

    console.log('Formatted applications:', {
      jobseekerId,
      count: formattedApplications.length,
      sample: formattedApplications[0]
    });

    res.status(200).json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching jobseeker applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching application with ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(id)
      .populate({
        path: 'jobId',
        populate: {
          path: 'employersId',
          model: 'User'
        }
      })
      .populate('jobseeker')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Found application:', application);

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error in getApplicationById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching applications for user:', userId);

    // Fetch applications with populated job and employer data
    const applications = await Application.find({ 
      jobseeker: userId 
    })
    .populate({
      path: 'jobId',
      populate: {
        path: 'employersId',
        model: 'User',
        select: 'companyInfo' // CompanyInfo is part of User model
      }
    });

    console.log('Found applications:', {
      count: applications.length,
      applications: applications.map(app => ({
        id: app._id,
        jobId: app.jobId._id.toString(),
        jobTitle: app.jobId.jobTitle,
        employerInfo: app.jobId.employersId?.companyInfo || {}
      }))
    });

    // Format the response data
    const formattedData = applications.map(app => ({
      jobId: app.jobId._id.toString(),
      jobTitle: app.jobId.jobTitle,
      companyName: app.jobId.employersId?.companyInfo?.companyName || 'N/A',
      companyLogo: app.jobId.employersId?.companyInfo?.companyLogo || null,
      status: app.status,
      appliedDate: app.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

export const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, additionalInfo } = req.body;

    const application = await Application.findOne({
      _id: id,
      jobseeker: req.user._id // Ensure the application belongs to the user
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    application.status = 'cancelled';
    application.cancellation = {
      reason,
      additionalInfo,
      date: new Date()
    };

    await application.save();

    res.json({
      success: true,
      message: 'Application cancelled successfully',
      data: application
    });

  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling application'
    });
  }
};

export default {
  submitApplication,
  getApplicationDetails,
  updateApplicationStatus,
  getEmployerApplications,
  getJobSeekerApplications,
  getApplicationById,
  getMyApplications,
  cancelApplication
};
