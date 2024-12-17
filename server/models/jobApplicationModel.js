import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  path: String,
  originalName: String,
  mimeType: String
});

const applicationSchema = new mongoose.Schema({
  jobseeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicationData: {
    basicInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phoneNumber: String,
      address: String,
      city: String,
      province: String,
      country: String,
      postalCode: String
    },
    workHistory: {
      type: [{
        previousJobTitle: String,
        companyName: String,
        startDate: Date,
        endDate: Date,
        isCurrentJob: Boolean,
        keyResponsibility: String
      }],
      required: false
    },
    jobPreferences: {
      availability: String,
      preferredStartDate: Date,
      accommodation: {
        required: Boolean,
        details: String,
        types: {
          mobilityAccess: Boolean,
          visualAids: Boolean,
          hearingAids: Boolean,
          flexibleSchedule: Boolean
        }
      }
    },
    questionnaireAnswers: [String]
  },
  documents: {
    resumeUrl: documentSchema,
    coverLetterUrl: documentSchema
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'interview', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  cancellation: {
    reason: String,
    additionalInfo: String,
    date: Date
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewDetails: {
    hasReviewed: {
      type: Boolean,
      default: false
    },
    reviewedAt: Date,
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  }
}, {
  timestamps: true
});

// Add compound unique index for jobseeker and jobId
applicationSchema.index({ jobseeker: 1, jobId: 1 }, { unique: true });

// Pre-save middleware to check for existing application
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingApplication = await this.constructor.findOne({
      jobseeker: this.jobseeker,
      jobId: this.jobId
    });

    if (existingApplication) {
      const error = new Error('You have already applied for this job');
      error.code = 11000; // Duplicate key error code
      return next(error);
    }
  }
  next();
});

// Add static method to check if application exists
applicationSchema.statics.hasApplied = async function(jobseekerId, jobId) {
  const application = await this.findOne({
    jobseeker: jobseekerId,
    jobId: jobId
  });
  return !!application;
};

// Add instance method to check if can apply
applicationSchema.methods.canApply = async function() {
  const existingApplication = await this.constructor.findOne({
    jobseeker: this.jobseeker,
    jobId: this.jobId
  });
  return !existingApplication;
};

// Error handling for duplicate applications
applicationSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    next(new Error('You have already applied for this job'));
  } else {
    next(error);
  }
});

// Debug middleware
applicationSchema.pre('find', function() {
  console.log('Application Find Query:', this.getQuery());
});

// Status update middleware
applicationSchema.post('save', async function(doc) {
  if (doc.reviewDetails.hasReviewed && doc.status !== 'completed') {
    doc.status = 'completed';
    await doc.save();
  }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
