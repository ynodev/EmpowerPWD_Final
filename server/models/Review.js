import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyInfo',
    required: true
  },
  jobseekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review; 