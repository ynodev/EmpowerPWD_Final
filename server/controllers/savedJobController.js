import SavedJob from '../models/savedJobModel.js';

export const saveJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user._id;  // Get user ID from auth middleware

        // Check if already saved
        const existingSave = await SavedJob.findOne({
            jobSeeker: userId,
            job: jobId
        });

        if (existingSave) {
            return res.status(400).json({
                success: false,
                message: 'Job already saved'
            });
        }

        // Create new saved job
        const savedJob = await SavedJob.create({
            jobSeeker: userId,
            job: jobId
        });

        // Populate job details
        const populatedJob = await SavedJob.findById(savedJob._id)
            .populate({
                path: 'job',
                select: 'jobTitle jobLocation employmentType salaryMin salaryMax jobDescription employersId',
                populate: {
                    path: 'employersId',
                    select: 'companyInfo.companyName companyInfo.companyLogo'
                }
            });

        return res.status(201).json({
            success: true,
            _id: populatedJob._id,  // Return the savedJob ID for unsaving later
            data: populatedJob
        });

    } catch (error) {
        console.error('Error in saveJob:', error);
        return res.status(500).json({
            success: false,
            message: 'Error saving job'
        });
    }
};

export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.user._id;

        const savedJobs = await SavedJob.find({ jobSeeker: userId })
            .populate({
                path: 'job',
                select: 'jobTitle jobLocation employmentType salaryMin salaryMax jobDescription employersId',
                populate: {
                    path: 'employersId',
                    select: 'companyInfo.companyName companyInfo.companyLogo'
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: savedJobs
        });

    } catch (error) {
        console.error('Error in getSavedJobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching saved jobs'
        });
    }
};

export const deleteSavedJob = async (req, res) => {
    try {
        const savedJobId = req.params.savedJobId;
        const userId = req.user._id;

        const savedJob = await SavedJob.findOne({
            _id: savedJobId,
            jobSeeker: userId
        });

        if (!savedJob) {
            return res.status(404).json({
                success: false,
                message: 'Saved job not found'
            });
        }

        await savedJob.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Job unsaved successfully'
        });

    } catch (error) {
        console.error('Error in deleteSavedJob:', error);
        return res.status(500).json({
            success: false,
            message: 'Error unsaving job'
        });
    }
};

export const checkSavedJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user._id;

        const savedJob = await SavedJob.findOne({
            jobSeeker: userId,
            job: jobId
        });

        return res.status(200).json({
            success: true,
            isSaved: !!savedJob,
            savedJobId: savedJob?._id  // Return the savedJob ID if it exists
        });

    } catch (error) {
        console.error('Error in checkSavedJob:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking saved status'
        });
    }
};

