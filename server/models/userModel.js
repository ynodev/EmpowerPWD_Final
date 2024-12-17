import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  isAssistant: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  forgotPasswordOTP: String,
  forgotPasswordOTPExpiry: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const BasicInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  age: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  profilePicture: String,
  aboutMe: { type: String }
}, { timestamps: true });

const LocationInfoSchema = new mongoose.Schema({
  country: { type: String, required: true },
  region: { type: String, required: true },
  province: { type: String, required: true },
  barangay: { type: String, required: true },
  city: { type: String, required: true },
  postal: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

// Job Seeker specific schemas
const DisabilityInfoSchema = new mongoose.Schema({
  disabilityType: { type: [String ], required: true},
  disabilityAdditionalInfo: String
}, { timestamps: true });

const WorkPreferencesSchema = new mongoose.Schema({
  preferredJobTitles: { type: [String] },
  industry:{ type: [String]} ,
  employmentType: String,
  skills: [String]
}, { timestamps: true }); 

// Add these schemas after DisabilityInfoSchema

const WorkExperienceSchema = new mongoose.Schema({
  company: { type: String, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  isCurrentlyWorking: { type: Boolean, default: false },
  jobTitle: { type: String, default: null },
  responsibilities: { type: [String], default: [] },
  skills: { type: [String], default: [] }
}, { timestamps: true });

const EducationSchema = new mongoose.Schema({
  educationalLevel: {
    type: String,
    enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Certificate', 'Other'],
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  location: {
    city: String,
    country: String,
    address: String
  },
  batchYear: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    isCurrentlyEnrolled: { type: Boolean, default: false }
  },
  highSchool: {
    track: {
      type: String,
      enum: ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Arts and Design', 'Sports', 'Other']
    },
    strand: String,
    grade: String,
    awards: [String]
  },
  college: {
    courseOrProgram: String,
    fieldOfStudy: String,
    gpa: String,
    awards: [String]
  },
  certificate: {
    title: { 
      type: String,
      required: function() {
        return this.educationalLevel === 'Certificate';
      }
    },
    issuingOrganization: String,
    credentialID: String,
    credentialURL: String,
    issueDate: Date,
    expiryDate: Date
  }
}, { timestamps: true });

// Add validation based on educationalLevel
EducationSchema.pre('validate', function(next) {
  if (this.educationalLevel === 'High School') {
    // Validate high school fields
    this.college = undefined;
    this.certificate = undefined;
    if (!this.highSchool?.track) {
      this.invalidate('highSchool.track', 'Track is required for high school');
    }
  } else if (this.educationalLevel === 'Certificate') {
    // Validate certificate fields
    this.college = undefined;
    this.highSchool = undefined;
    if (!this.certificate?.issuingOrganization) {
      this.invalidate('certificate.issuingOrganization', 'Issuing organization is required for certificates');
    }
  } else if (['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(this.educationalLevel)) {
    // Validate college fields
    this.highSchool = undefined;
    this.certificate = undefined;
    if (!this.college?.courseOrProgram) {
      this.invalidate('college.courseOrProgram', 'Course/Program is required for college degrees');
    }
    if (!this.college?.fieldOfStudy) {
      this.invalidate('college.fieldOfStudy', 'Field of study is required for college degrees');
    }
  }
  next();
});

// Updated JobSeeker schema
const JobSeekerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'AssistantSchema' },
  basicInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicInfo', required: true },
  locationInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'LocationInfo', required: true },
  disabilityInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'DisabilityInfo', required: true },
  workPreferences: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkPreferences', required: true },
  workExperience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkExperience', required: true }],
  education: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education', required: true }],
  keySkills: [String],
  documents: {
    
    resume: {
      path: String,
      originalName: String,
      mimeType: String
    },
    pwdId: {
      path: String,
      originalName: String,
      mimeType: String
    },
    validId: {
      path: String,
      originalName: String,
      mimeType: String
    },
    certifications: [{
      path: String,
      originalName: String,
      mimeType: String
    }]
  }
}, { timestamps: true });

// Company User Schema (New)
const CompanyUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true }, // Added employer reference
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'moderator', 'recruiter', 'viewer'],
    required: true 
  },
  permissions: [{ 
    type: String,
    enum: [
      'manage_jobs',
      'post_jobs',
      'edit_jobs',
      'delete_jobs',
      'view_applications',
      'manage_applications',
      'manage_company_profile',
      'manage_users',
      'view_analytics',
      'manage_billing',
      'send_messages'
    ]
  }],
  department: String,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CompanyUser'
  },
  lastLogin: Date
}, { 
  timestamps: true,
  indexes: [
    { employer: 1, user: 1 }, // Added compound index for quick lookups
  ]
});

const CompanyInfoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  industry: { type: [String], required: true },
  companySize: { type: String, required: true },
  website: String,
  companyAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  companyDescription: { type: String, required: true },
  establishmentDate: Date,
  companyLogo: { type: String },
  departments: [String],
  reviews: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  averageRating: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ContactPersonSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  alternativePhoneNumber: String,
  email: { type: String, required: true },
  linkedIn: String,
  department: { type: [String], default: [] } // Changed to array of strings
}, { timestamps: true });

const JobPostingSchema = new mongoose.Schema({
  jobTitles: { type: [String], required: true },
  employmentType: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyUser' } // Added reference to company user
}, { timestamps: true });

const PWDSupportSchema = new mongoose.Schema({
  accessibilityFeatures: { type: [String], default: [] }, // Changed to array of strings
  remoteWorkOptions: { type: Boolean, default: false },
  supportPrograms: { type: [String], default: [] }, // Also making this an array
  additionalInfo: { type: String, default: '' }
}, { timestamps: true });
// Updated Employer schema with company users
const EmployerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyInfo', required: true },
  contactPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactPerson', required: true },
  pwdSupport: { type: mongoose.Schema.Types.ObjectId, ref: 'PWDSupport', required: true },
  documents: {
    companyPermit: {
      path: String,
      originalName: String,
      mimeType: String
    },
    taxId: {
      path: String,
      originalName: String,
      mimeType: String
    },
    incorporation: {
      path: String,
      originalName: String,
      mimeType: String
    },
    otherDocs: [{
      path: String,
      originalName: String,
      mimeType: String
    }]
  }
}, { timestamps: true });

// Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'ADMIN_CREATED',
      'ADMIN_UPDATED',
      'ADMIN_DELETED',
      'PERMISSIONS_UPDATED',
      'STATUS_UPDATED',
      'USER_VERIFIED',
      'JOB_APPROVED',
      'JOB_REJECTED',
      'RESOURCE_ADDED',
      'RESOURCE_UPDATED',
      'RESOURCE_DELETED',
      'LOGIN',
      'LOGOUT'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add this schema after other schemas
const SavedVideoSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: String,
  description: String,
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', UserSchema);
const CompanyUser = mongoose.model('CompanyUser', CompanyUserSchema);
const CompanyInfo = mongoose.model('CompanyInfo', CompanyInfoSchema);
const ContactPerson = mongoose.model('ContactPerson', ContactPersonSchema);
const JobPosting = mongoose.model('JobPosting', JobPostingSchema);
const PWDSupport = mongoose.model('PWDSupport', PWDSupportSchema);
const Employer = mongoose.model('Employer', EmployerSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
const BasicInfo = mongoose.model('BasicInfo', BasicInfoSchema);
const LocationInfo = mongoose.model('LocationInfo', LocationInfoSchema);
const DisabilityInfo = mongoose.model('DisabilityInfo', DisabilityInfoSchema);
const WorkPreferences = mongoose.model('WorkPreferences', WorkPreferencesSchema);
const JobSeeker = mongoose.model('JobSeeker', JobSeekerSchema);
const Education = mongoose.model('Education', EducationSchema);
const WorkExperience = mongoose.model('WorkExperience', WorkExperienceSchema);
const SavedVideo = mongoose.model('SavedVideo', SavedVideoSchema);

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status !== 'pending';
    }
  },
  accessLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'moderator'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_admins',
      'manage_users',
      'manage_jobs',
      'manage_employers',
      'manage_resources',
      'view_analytics',
      'manage_settings'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  email: {
    type: String,
    required: function() {
      return this.status === 'pending';
    }
  },
  verificationToken: String,
  verificationExpires: Date,
  lastLogin: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true
});

// Add methods to check permissions
AdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

AdminSchema.methods.isSuperAdmin = function() {
  return this.accessLevel === 'super_admin';
};

// Create the Admin model
const Admin = mongoose.model('Admin', AdminSchema);

// Assistant Schema for JobSeeker
const AssistantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
  role: { 
    type: String, 
    enum: [],
    required: true 
  },
  basicInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    relationship: { type: String, required: true }
  },
  verificationDocument: {
    path: String,
    originalName: String,
    mimeType: String
  }
}, { 
  timestamps: true,
  indexes: [
    { user: 1, jobSeeker: 1 }
  ]
});

// Export models
export {
  User,
  Admin,
  CompanyUser,
  CompanyInfo,
  ContactPerson,
  JobPosting,
  PWDSupport,
  Employer,
  ActivityLog,
  BasicInfo,
  LocationInfo,
  DisabilityInfo,
  WorkPreferences,
  Education,
  WorkExperience,
  JobSeeker,
  SavedVideo,
  AssistantSchema
};

export default Employer;