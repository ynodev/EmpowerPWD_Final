import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
    jobSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'interviewing'],
        default: 'pending'
    },
    interviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }],
    appliedDate: {
        type: Date,
        default: Date.now
    }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication; 