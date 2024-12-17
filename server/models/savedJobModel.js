import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
    jobSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate saves
savedJobSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);
export default SavedJob;
