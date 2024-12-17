import mongoose from 'mongoose';
import Job from '../models/job.js'; // Adjust the path as needed
import { createNotification } from './notificationController.js';
import Application from '../models/jobApplicationModel.js'; // Fix the import path

// Helper function to validate ObjectId
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new job posting
export const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      jobLocation,
      workSetup,
      industry,
      employmentType,
      applicationDeadline,
      keySkills,
      otherSkills,
      educationLevel,
      yearsOfExperience,
      salaryMin,
      salaryMax,
      salaryBasis,
      benefits,
      additionalPerks,
      accessibilityFeatures,
      specialAccommodations,
      questioner,
      document,
      disabilityTypes,
      vacancy,
    } = req.body;

    const newJob = new Job({
      employersId: req.user._id,
      jobTitle,
      jobDescription,
      jobLocation,
      workSetup,
      industry,
      employmentType,
      applicationDeadline,
      keySkills,
      otherSkills,
      educationLevel,
      yearsOfExperience,
      salaryMin,
      salaryMax,
      salaryBasis,
      benefits,
      additionalPerks,
      accessibilityFeatures,
      specialAccommodations,
      questioner,
      document,
      disabilityTypes,
      vacancy: vacancy || 1,
      jobStatus: 'pending',
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!validateObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message,
    }); 
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    // Find the job without checking ownership
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'jobTitle',
      'jobDescription',
      'jobLocation',
      'workSetup',
      'industry',
      'employmentType',
      'applicationDeadline',
      'keySkills',
      'otherSkills',
      'educationLevel',
      'yearsOfExperience',
      'salaryMin',
      'salaryMax',
      'salaryBasis',
      'benefits',
      'additionalPerks',
      'accessibilityFeatures',
      'specialAccommodations',
      'jobStatus',
      'questioner',
      'document',
      'disabilityTypes',
      'vacancy'
    ];

    // Filter out undefined values and only include allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key) && updates[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    if (!validateObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify ownership
    if (job.employersId.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this job',
      });
    }

    job.jobStatus = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: job,
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message,
    });
  }
};

export const searchJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    // Get user's applications
    const userApplications = await Application.find({ jobseeker: userId }).select('jobId');
    const appliedJobIds = userApplications.map(app => app.jobId.toString());

    // Search jobs excluding applied ones
    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      jobStatus: 'active',
      $or: [
        { jobTitle: { $regex: query, $options: 'i' } },
        { jobDescription: { $regex: query, $options: 'i' } },
        { jobLocation: { $regex: query, $options: 'i' } }
      ]
    }).populate({
      path: 'employersId',
      populate: {
        path: 'companyInfo'
      }
    });

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching jobs',
      error: error.message
    });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!validateObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify ownership
    if (job.employersId.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these applications',
      });
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      workSetup,
      employmentType 
    } = req.query;
    
    const employerId = req.params.employerId;

    // Verify the requesting user matches the employerId
    if (req.user._id.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to employer jobs',
      });
    }

    const query = { employersId: employerId };
    
    // Status filter
    if (status && status !== 'All') {
      query.jobStatus = status.toLowerCase();
    }
    
    // Work setup filter
    if (workSetup && workSetup !== 'all') {
      query.workSetup = workSetup.toLowerCase();
    }

    // Employment type filter
    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType.toLowerCase();
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { jobDescription: { $regex: search, $options: 'i' } },
        { jobLocation: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await Job.countDocuments(query);

    // Calculate job counts by status
    const allJobs = await Job.find({ employersId: employerId });
    const jobCounts = {
      total: allJobs.length,
      active: allJobs.filter(job => job.jobStatus === 'active').length,
      inactive: allJobs.filter(job => job.jobStatus === 'inactive').length,
      pending: allJobs.filter(job => job.jobStatus === 'pending').length
    };

    return res.status(200).json({
      success: true,
      data: jobs,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      totalCount: count,
      jobCounts // Include job counts in the response
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message,
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's applications
    const userApplications = await Application.find({ 
      jobseeker: userId 
    }).select('jobId');

    const appliedJobIds = userApplications.map(app => app.jobId.toString());

    // Get active jobs with remaining vacancies
    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      jobStatus: 'active',
      remainingVacancies: { $gt: 0 }, // Only show jobs with remaining vacancies
      isActive: true
    }).populate({
      path: 'employersId',
      populate: {
        path: 'companyInfo'
      }
    });

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!validateObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findOneAndDelete({
      _id: jobId,
      employersId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized to delete'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

export const deleteMultipleJobs = async (req, res) => {
  try {
    const { jobIds, userId } = req.body;

    // Validate input
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job IDs provided'
      });
    }

    // Verify ownership of all jobs before deletion
    const jobs = await Job.find({
      _id: { $in: jobIds },
      employersId: req.user._id // Use req.user._id instead of employerId
    });

    if (jobs.length !== jobIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Some jobs do not belong to this employer'
      });
    }

    // Delete the jobs
    const result = await Job.deleteMany({
      _id: { $in: jobIds },
      employersId: req.user._id
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete multiple jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting jobs',
      error: error.message
    });
  }
};

export const updateJobStarStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { isStarred } = req.body;

    if (!validateObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findOneAndUpdate(
      { 
        _id: jobId,
        employersId: req.user._id 
      },
      { isStarred },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job star status updated successfully',
      data: job
    });

  } catch (error) {
    console.error('Update star status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating job star status',
      error: error.message
    });
  }
};

export const approveJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.status = 'approved';
        await job.save();

        // Create notification for job owner
        await createNotification({
            userId: job.userId,
            type: 'approval',
            title: 'Job Posting Approved',
            message: 'Your job posting has been approved and is now live.',
            jobId: job._id
        });

        res.json({
            success: true,
            message: 'Job approved successfully'
        });
    } catch (error) {
        console.error('Error approving job:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving job'
        });
    }
};

// Add this new function to get job statistics
export const getJobStats = async (req, res) => {
  try {
    // Get all jobs and filter by status
    const jobs = await Job.find();
    
    // Log raw data for debugging
    console.log('Raw jobs data:', jobs);
    
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.jobStatus.toUpperCase() === 'ACTIVE').length,
      pendingJobs: jobs.filter(job => job.jobStatus.toUpperCase() === 'PENDING').length
    };

    // Log the calculated stats
    console.log('Calculated Job Statistics:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message
    });
  }
};

// Add this function to update filled positions
export const updateFilledPositions = async (jobId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Increment filled positions
    job.filledPositions += 1;
    
    // This will trigger the pre-save middleware that checks vacancies
    await job.save();

    // If all positions are filled, create notification for employer
    if (job.filledPositions >= job.vacancy) {
      await createNotification({
        userId: job.employersId,
        type: 'vacancy',
        title: 'All Positions Filled',
        message: `All positions for "${job.jobTitle}" have been filled.`,
        jobId: job._id
      });
    }

    return job;
  } catch (error) {
    console.error('Error updating filled positions:', error);
    throw error;
  }
};

// Add this function to handle application acceptance
export const acceptApplication = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;

    // Update the application status
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status: 'accepted' },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update the job's filled positions
    const updatedJob = await updateFilledPositions(jobId);

    // Create notification for the applicant
    await createNotification({
      userId: application.applicantId,
      type: 'application',
      title: 'Application Accepted',
      message: 'Congratulations! Your job application has been accepted.',
      jobId: jobId
    });

    res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      data: {
        application,
        job: updatedJob
      }
    });
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting application',
      error: error.message
    });
  }
};

// Add these controller methods
export const incrementJobView = async (req, res) => {
  try {
    const { jobId } = req.params;
    await Job.findByIdAndUpdate(jobId, {
      $inc: { 'performance.views': 1 },
      'performance.lastUpdated': new Date()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const incrementJobClick = async (req, res) => {
  try {
    const { jobId } = req.params;
    await Job.findByIdAndUpdate(jobId, {
      $inc: { 'performance.clicks': 1 },
      'performance.lastUpdated': new Date()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const incrementJobApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    await Job.findByIdAndUpdate(jobId, {
      $inc: { 'performance.applications': 1 },
      'performance.lastUpdated': new Date()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add this function to handle hiring an applicant
export const hireApplicant = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;

    // Find the job and application
    const job = await Job.findById(jobId);
    const application = await Application.findById(applicationId);

    if (!job || !application) {
      return res.status(404).json({
        success: false,
        message: 'Job or application not found'
      });
    }

    // Check if there are remaining vacancies
    if (job.remainingVacancies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No vacancies remaining for this position'
      });
    }

    // Add to hired applicants
    job.hiredApplicants.push({
      applicationId: applicationId,
      jobseekerId: application.jobseeker
    });

    // Update application status
    application.status = 'hired';
    await application.save();

    // Save job (this will trigger the checkVacancies middleware)
    await job.save();

    // Create notification for the applicant
    await createNotification({
      userId: application.jobseeker,
      type: 'hired',
      title: 'Congratulations! You\'ve been hired!',
      message: `You've been hired for the position of ${job.jobTitle}`,
      jobId: jobId
    });

    res.status(200).json({
      success: true,
      message: 'Applicant hired successfully',
      data: {
        job,
        application
      }
    });

  } catch (error) {
    console.error('Error hiring applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error hiring applicant',
      error: error.message
    });
  }
};
