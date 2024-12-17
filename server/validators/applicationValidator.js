import mongoose from 'mongoose';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''));
};

export const validateApplication = (applicationData) => {
  const errors = [];

  // Check if required IDs are valid
  if (!mongoose.Types.ObjectId.isValid(applicationData.userId)) {
    errors.push('Invalid userId');
  }
  if (!mongoose.Types.ObjectId.isValid(applicationData.jobId)) {
    errors.push('Invalid jobId');
  }

  // Validate Basic Info
  const { basicInfo } = applicationData;
  if (!basicInfo) {
    errors.push('Basic information is required');
  } else {
    if (!basicInfo.firstName || basicInfo.firstName.trim().length < 2) {
      errors.push('First name is required and must be at least 2 characters');
    }
    if (!basicInfo.lastName || basicInfo.lastName.trim().length < 2) {
      errors.push('Last name is required and must be at least 2 characters');
    }
    if (!basicInfo.email || !validateEmail(basicInfo.email)) {
      errors.push('Valid email is required');
    }
    if (!basicInfo.phoneNumber || !validatePhoneNumber(basicInfo.phoneNumber)) {
      errors.push('Valid phone number is required');
    }
    if (!basicInfo.location || basicInfo.location.trim().length < 2) {
      errors.push('Location is required');
    }
  }

  // Validate Work History
  const { workHistory } = applicationData;
  if (workHistory) {
    if (workHistory.previousJobTitle && workHistory.previousJobTitle.trim().length < 2) {
      errors.push('Previous job title must be at least 2 characters');
    }
    if (workHistory.companyName && workHistory.companyName.trim().length < 2) {
      errors.push('Company name must be at least 2 characters');
    }
  }

  // Validate Documents
  const { documents } = applicationData;
  if (documents) {
    if (documents.resumeUrl && !documents.resumeUrl.startsWith('http')) {
      errors.push('Resume URL must be a valid URL');
    }
    if (documents.coverLetterUrl && !documents.coverLetterUrl.startsWith('http')) {
      errors.push('Cover letter URL must be a valid URL');
    }
  }

  // Validate Job Preferences
  const { jobPreferences } = applicationData;
  if (jobPreferences) {
    if (jobPreferences.preferredStartDate) {
      const date = new Date(jobPreferences.preferredStartDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid preferred start date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to validate application status
export const validateApplicationStatus = (status) => {
  const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];
  return validStatuses.includes(status);
};

export const validateApplicationUpdate = (updateData) => {
  const errors = [];

  if (updateData.status && !validateApplicationStatus(updateData.status)) {
    errors.push('Invalid application status');
  }

  // Add any other update-specific validations here

  return {
    isValid: errors.length === 0,
    errors
  };
};