import { User, JobSeeker, Employer } from '../models/userModel.js';
import mongoose from 'mongoose';
import Application from '../models/jobApplicationModel.js';
import Job from '../models/job.js';

class DashboardController {
  /**
   * Get overall platform statistics
   */
  async getPlatformStats(req, res) {
    try {
      // Basic stats using Promise.all for parallel execution
      const [
        totalSeekers,
        totalEmployers,
        totalJobs,  // Updated to total jobs
        pendingApplications,
        totalVerifiedUsers,  // Updated to total verified users
        totalUnverifiedUsers,
        completedJobs,
        activeUsers,
        reportedJobs
      ] = await Promise.all([
        User.countDocuments({ role: 'jobseeker', isVerified: true }),
        User.countDocuments({ role: 'employer', isVerified: true }),
        Job.countDocuments({}),  // Count all jobs
        Application.countDocuments({ status: 'Pending' }),
        User.countDocuments({ isVerified: true }),  // Count all verified users
        User.countDocuments({ isVerified: false }),
        Job.countDocuments({ jobStatus: 'completed' }),
        User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30*24*60*60*1000) } }),
        Job.countDocuments({ 'flags.isReported': true })
      ]);
  
      // Calculate monthly growth
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const [currentMonthUsers, lastMonthUsers] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: lastMonthDate } }),
        User.countDocuments({
          createdAt: {
            $gte: new Date(lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)),
            $lt: lastMonthDate
          }
        })
      ]);
  
      const monthlyGrowth = lastMonthUsers > 0 
        ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
        : 100;
  
      return res.status(200).json({
        success: true,
        data: {
          totalSeekers,
          totalEmployers,
          totalJobs,  // Return total jobs
          pendingApplications,
          monthlyGrowth,
          totalVerifiedUsers,  // Return total verified users
          totalUnverifiedUsers,
          completedJobs,
          activeUsers,
          reportedJobs
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching platform statistics',
        error: error.message
      });
    }
  }  

  /**
   * Get monthly trend data for the last 6 months
   */
  async getMonthlyTrends(req, res) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyStats = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            isVerified: true
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              month: '$_id.month',
              year: '$_id.year'
            },
            stats: {
              $push: {
                role: '$_id.role',
                count: '$count'
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]);

      // Transform aggregation results into the required format
      const formattedStats = monthlyStats.map(stat => {
        const monthDate = new Date(stat._id.year, stat._id.month - 1);
        return {
          name: monthDate.toLocaleString('default', { month: 'short' }),
          seekers: stat.stats.find(s => s.role === 'jobseeker')?.count || 0,
          employers: stat.stats.find(s => s.role === 'employer')?.count || 0,
          jobs: 0 // Will be updated in the next step
        };
      });

      // Get jobs data separately
      const jobStats = await Job.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Merge jobs data into formatted stats
      jobStats.forEach(jobStat => {
        const monthDate = new Date(jobStat._id.year, jobStat._id.month - 1);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const statIndex = formattedStats.findIndex(stat => stat.name === monthName);
        if (statIndex !== -1) {
          formattedStats[statIndex].jobs = jobStat.count;
        }
      });

      return res.status(200).json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching monthly trends',
        error: error.message
      });
    }
  }

  /**
   * Get recent pending jobs
   */
  async getPendingJobs(req, res) {
    try {
      const pendingJobs = await Job.aggregate([
        {
          $match: { jobStatus: 'pending' }  // Match jobs with a 'pending' status
        },
        {
          $lookup: {
            from: 'employers',             
            localField: 'employersId',     
            foreignField: '_id',            
            as: 'employer'                 
          }
        },
        {
          $unwind: '$employer'              
        },
        {
          $lookup: {
            from: 'companyinfos',           
            localField: 'employer.companyInfo',
            foreignField: '_id',
            as: 'companyInfo'
          }
        },
        {
          $unwind: '$companyInfo'           
        },
        {
          $project: {
            id: '$_id',
            company: '$companyInfo.companyName', 
            position: '$jobTitle',
            location: '$jobLocation',
            date: '$createdAt',
            status: '$jobStatus'
          }
        },
        {
          $sort: { date: -1 }                
        },
        {
          $limit: 5                           
        }
      ]);

      return res.status(200).json({
        success: true,
        data: pendingJobs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching pending jobs',
        error: error.message
      });
    }
  }


  /**
   * Get recent pending users
  **/
  async getPendingUsers(req, res) {
    try {
      // Fetch unverified users (both jobseekers and employers) with specific fields
      const pendingUsers = await User.find({
        isVerified: false,
      })
        .sort({ createdAt: -1 }) // Sort by creation date, latest first
        .limit(5) // Limit to 5 results
        .select('email role createdAt isVerified'); // Select specific fields
  
      return res.status(200).json({
        success: true,
        data: pendingUsers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching pending users',
        error: error.message,
      });
    }
  }
  
  
  

  /**
   * Get recent activity logs
   */
  async getRecentActivity(req, res) {
    try {
      const recentActivity = await ActivityLog.find()
        .populate('companyUser', 'role')
        .populate('employer', 'companyInfo')
        .sort('-createdAt')
        .limit(10);

      return res.status(200).json({
        success: true,
        data: recentActivity
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching recent activity',
        error: error.message
      });
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(req, res) {
    try {
      const { jobId } = req.params;
      const { status } = req.body;

      const job = await Job.findByIdAndUpdate(
        jobId,
        { jobStatus: status },
        { new: true }
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Log the activity
      await ActivityLog.create({
        companyUser: req.user._id,
        employer: job.employersId,
        action: `Updated job status to ${status}`,
        details: {
          jobId: job._id,
          previousStatus: job.jobStatus,
          newStatus: status
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Job status updated successfully',
        data: job
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating job status',
        error: error.message
      });
    }
  }
}

export default new DashboardController();