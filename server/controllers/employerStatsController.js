import Job from '../models/job.js';
import Application from '../models/jobApplicationModel.js';

export const getEmployerStats = async (req, res) => {
    try {
        const employerId = req.user._id;

        // Get jobs for this employer that are active
        const employerJobs = await Job.find({ 
            employersId: employerId,
            isActive: true  // Only get active jobs
        });
        const jobIds = employerJobs.map(job => job._id);

        // Get total active jobs count
        const activeJobs = jobIds.length;  // Count of active jobs

        // Get total applications for active jobs only
        const totalApplications = await Application.countDocuments({
            jobId: { $in: jobIds }  // Only count applications for active jobs
        });

        // Get pending reviews for active jobs
        const pendingReviews = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: 'pending',
            'reviewDetails.hasReviewed': false
        });

        // Get hires made for active jobs
        const hiresMade = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: 'accepted'
        });

        // Get recent applicants for active jobs
        const recentApplicants = await Application.find({
            jobId: { $in: jobIds }
        })
        .populate('jobseeker', 'firstName lastName email disabilityInfo')
        .populate('jobId', 'jobTitle employersId')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        // Format the applicants data
        const formattedApplicants = recentApplicants.map(applicant => ({
            _id: applicant._id,
            status: applicant.status,
            createdAt: applicant.createdAt,
            basicInfo: applicant.applicationData?.basicInfo || {},
            jobId: {
                _id: applicant.jobId._id,
                jobTitle: applicant.jobId.jobTitle
            },
            jobseeker: {
                _id: applicant.jobseeker._id,
                firstName: applicant.applicationData?.basicInfo.firstName,
                lastName: applicant.applicationData?.basicInfo.lastName,
                email: applicant.jobseeker.email,
                disabilityInfo: applicant.jobseeker.disabilityInfo
            }
        }));

        // Get application trends data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const applicationTrends = await Application.aggregate([
            {
                $match: {
                    jobId: { $in: jobIds },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    applications: { $sum: 1 },
                    interviews: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "interview"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Get applications by status
        const applicationsByStatus = await Application.aggregate([
            {
                $match: {
                    jobId: { $in: jobIds }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                activeJobs,
                totalApplications,
                pendingReviews,
                hiresMade,
                recentApplicants: formattedApplicants,
                applicationTrends,
                applicationsByStatus
            }
        });

    } catch (error) {
        console.error('Error fetching employer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employer statistics',
            error: error.message
        });
    }
};
