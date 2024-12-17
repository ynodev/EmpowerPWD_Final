import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyInfo',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Add an index to improve query performance
feedbackSchema.index({ company: 1, status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;