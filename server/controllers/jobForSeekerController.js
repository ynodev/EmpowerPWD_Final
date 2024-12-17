import Job from '../models/job.js';
import { Employer } from '../models/userModel.js';

export const getAllJobs = async (req, res) => {
  try {
    // First get all jobs
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 });

    // Get employer data for each job
    const jobsWithEmployerData = await Promise.all(jobs.map(async (job) => {
      try {
        // Find employer for this job
        const employer = await Employer.findOne({ user: job.employersId })
          .populate('companyInfo')
          .populate('contactPerson')
          .populate('pwdSupport');

        if (!employer) {
          console.log(`No employer found for job ${job._id}`);
          // Return job without employer data
          return {
            ...job.toObject(),
            employer: {
              companyInfo: {},
              contactPerson: {},
              pwdSupport: {}
            }
          };
        }

        // Return job with employer data
        return {
          ...job.toObject(),
          employer: {
            companyInfo: employer.companyInfo || {},
            contactPerson: employer.contactPerson || {},
            pwdSupport: employer.pwdSupport || {}
          }
        };
      } catch (error) {
        console.error(`Error processing job ${job._id}:`, error);
        // Return job without employer data if there's an error
        return {
          ...job.toObject(),
          employer: {
            companyInfo: {},
            contactPerson: {},
            pwdSupport: {}
          }
        };
      }
    }));

    res.json({
      success: true,
      count: jobsWithEmployerData.length,
      data: jobsWithEmployerData
    });
  } catch (error) {
    console.error('Error in getAllJobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('employersId', 'email role')
      .select('+questioner');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get employer info with more company details
    const employer = await Employer.findOne({ user: job.employersId._id })
      .populate({
        path: 'companyInfo',
        select: 'companyName industry companySize companyLogo website companyDescription location'
      });

    // Clean up the logo path if it exists
    if (employer?.companyInfo?.companyLogo) {
      employer.companyInfo.companyLogo = employer.companyInfo.companyLogo.replace(/^\//, '');
    }

    const jobWithCompanyInfo = {
      ...job.toObject(),
      employer: employer ? {
        companyInfo: employer.companyInfo
      } : null,
      questionnaire: job.questioner || []
    };

    return res.status(200).json({
      success: true,
      data: jobWithCompanyInfo
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching job details',
      error: error.message
    });
  }
};

export const getJobQuestionnaire = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId)
      .select('questioner');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: job.questioner || []
    });
  } catch (error) {
    console.error('Error fetching job questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching job questionnaire',
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
