import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  dateTime: {
    type: Date,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  jobseekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  meetingLink: String,
  notes: String,
  status: {
    type: String,
    enum: ['pending','scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  result: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSlot: {
    date: Date,
    startTime: String,
    endTime: String,
    isBooked: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Add method to check slot availability
interviewSchema.statics.isSlotAvailable = async function(date, startTime, endTime, employerId) {
  const existingInterview = await this.findOne({
    employerId,
    'timeSlot.date': new Date(date),
    'timeSlot.startTime': startTime,
    'timeSlot.endTime': endTime,
    status: { $nin: ['cancelled'] }
  });

  return !existingInterview;
};

// Add a pre-find middleware to automatically populate references
interviewSchema.pre('find', function() {
  this.populate('jobId')
      .populate('employerId')
      .populate('applicationId');
});

export default mongoose.model('Interview', interviewSchema); 
