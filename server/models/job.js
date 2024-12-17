import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  employersId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add employerId reference
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  jobLocation: { type: String, required: true },
  workSetup: { type: String, required: true },
  industry: { type: [String], required: true },
  employmentType: { type: String, required: true },
  applicationDeadline: { type: Date, required: true },
  keySkills: { type: [String], default: [] },
  otherSkills: { type: String, default: '' },
  educationLevel: { type: String, required: true },
  yearsOfExperience: { type: String, required: true },
  salaryMin: { type: Number, required: true },
  salaryMax: { type: Number, required: true },
  benefits: { type: [String], default: [] },
  additionalPerks: { type: String, default: '' },
  accessibilityFeatures: { type: [String], default: [] },
  specialAccommodations: { type: String, default: '' },
  jobStatus: { type: String, default: 'pending' },  // Default value set to "pending"
  isStarred: { type: Boolean, default: false },  // Default value set to false
  salaryBasis: { type: String, default: 'monthly' },
  questioner: { type: [String], default: [] },
  document: { type: String, default: 'resume' },
  disabilityTypes: { type: [String], default: [] },
  vacancy: { type: Number, default: 1 },
  hiredApplicants: [{
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    jobseekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hiredDate: {
      type: Date,
      default: Date.now
    }
  }],
  remainingVacancies: { type: Number, default: function() {
    return this.vacancy;
  }},
  isActive: { type: Boolean, default: true },
  performance: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Update the checkVacancies method
jobSchema.methods.checkVacancies = function() {
  // Update remainingVacancies based on hired applicants
  this.remainingVacancies = this.vacancy - this.hiredApplicants.length;
  
  // If no vacancies left, mark job as inactive
  if (this.remainingVacancies <= 0) {
    this.isActive = false;
    this.jobStatus = 'filled';
  }
};

// Add pre-save middleware
jobSchema.pre('save', function(next) {
  this.checkVacancies();
  next();
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;
