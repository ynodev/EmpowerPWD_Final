import { 
  JobSeeker, 
  User, 
  BasicInfo, 
  LocationInfo, 
  WorkExperience,
  Education
} from '../models/userModel.js';
import mongoose from 'mongoose';

// Get user profile with all related data
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    const jobSeeker = await JobSeeker.findOne({ user: userId })
      .populate('user')
      .populate('basicInfo')
      .populate('locationInfo')
      .populate('workExperience')
      .populate('education');

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      profile: jobSeeker
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update basic info
const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user?._id;
    const updates = req.body;

    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const updatedBasicInfo = await BasicInfo.findByIdAndUpdate(
      jobSeeker.basicInfo,
      updates,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      basicInfo: updatedBasicInfo
    });
  } catch (error) {
    console.error('Error in updateBasicInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update location info
const updateLocationInfo = async (req, res) => {
  try {
    const userId = req.user?._id;
    const updates = req.body;

    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const updatedLocationInfo = await LocationInfo.findByIdAndUpdate(
      jobSeeker.locationInfo,
      updates,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      locationInfo: updatedLocationInfo
    });
  } catch (error) {
    console.error('Error in updateLocationInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Work Experience functions
const getWorkExperience = async (req, res) => {
  try {
    const userId = req.user?._id;
    const jobSeeker = await JobSeeker.findOne({ user: userId }).populate('workExperience');
    
    return res.status(200).json({
      success: true,
      workExperience: jobSeeker?.workExperience || []
    });
  } catch (error) {
    console.error('Error in getWorkExperience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addWorkExperience = async (req, res) => {
  try {
    const userId = req.user?._id;
    const workExpData = req.body;

    // First find the job seeker
    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Create new work experience document
    const newWorkExp = new WorkExperience({
      company: workExpData.company,
      startDate: workExpData.startDate,
      endDate: workExpData.endDate,
      isCurrentlyWorking: workExpData.isCurrentlyWorking,
      jobTitle: workExpData.jobTitle,
      responsibilities: workExpData.responsibilities,
      skills: workExpData.skills
    });

    // Save the work experience document first
    await newWorkExp.save();

    // Update JobSeeker's workExperience array with the new ID
    await JobSeeker.updateOne(
      { _id: jobSeeker._id },
      { $addToSet: { workExperience: newWorkExp._id } }
    );

    // Fetch the updated jobSeeker with populated work experience
    const updatedJobSeeker = await JobSeeker.findById(jobSeeker._id)
      .populate('workExperience');

    return res.status(200).json({
      success: true,
      workExperience: updatedJobSeeker.workExperience
    });

  } catch (error) {
    console.error('Error in addWorkExperience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add the deleteWorkExperience function
const deleteWorkExperience = async (req, res) => {
  try {
    const userId = req.user?._id;
    const workExpId = req.params.id;

    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Remove work experience ID from jobSeeker's array
    jobSeeker.workExperience = jobSeeker.workExperience.filter(
      id => id.toString() !== workExpId
    );
    await jobSeeker.save();

    // Delete the work experience document
    await WorkExperience.findByIdAndDelete(workExpId);

    // Get updated data with populated work experience
    const updatedJobSeeker = await JobSeeker.findById(jobSeeker._id)
      .populate('workExperience');

    return res.status(200).json({
      success: true,
      workExperience: updatedJobSeeker.workExperience
    });

  } catch (error) {
    console.error('Error in deleteWorkExperience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Education functions
const getEducation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const jobSeeker = await JobSeeker.findOne({ user: userId })
      .populate({
        path: 'education',
        options: { sort: { 'batchYear.start': -1 } } // Sort by start year, most recent first
      });
    
    return res.status(200).json({
      success: true,
      education: jobSeeker?.education || []
    });
  } catch (error) {
    console.error('Error in getEducation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addEducation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const educationData = req.body;

    // First find the job seeker
    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Create education document based on level
    const educationDoc = {
      educationalLevel: educationData.educationalLevel,
      schoolName: educationData.schoolName,
      batchYear: educationData.batchYear
    };

    // Add level-specific fields
    if (educationData.educationalLevel === 'High School') {
      educationDoc.highSchool = {
        track: educationData.highSchool.track,
        strand: educationData.highSchool.strand,
        grade: educationData.highSchool.grade
      };
    } else if (educationData.educationalLevel === 'Certificate') {
      educationDoc.certificate = {
        issuingOrganization: educationData.certificate.issuingOrganization,
        credentialID: educationData.certificate.credentialID,
        credentialURL: educationData.certificate.credentialURL,
        issueDate: educationData.certificate.issueDate,
        expiryDate: educationData.certificate.expiryDate
      };
    } else if (['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(educationData.educationalLevel)) {
      educationDoc.college = {
        courseOrProgram: educationData.college.courseOrProgram,
        fieldOfStudy: educationData.college.fieldOfStudy,
        gpa: educationData.college.gpa
      };
    }

    // Create new education document
    const newEducation = new Education(educationDoc);
    await newEducation.save();

    // Update JobSeeker's education array
    await JobSeeker.updateOne(
      { _id: jobSeeker._id },
      { $addToSet: { education: newEducation._id } }
    );

    // Fetch updated data
    const updatedJobSeeker = await JobSeeker.findById(jobSeeker._id)
      .populate('education');

    return res.status(200).json({
      success: true,
      education: newEducation
    });

  } catch (error) {
    console.error('Error in addEducation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const educationId = req.params.id;

    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Remove education ID from jobSeeker's array
    jobSeeker.education = jobSeeker.education.filter(
      id => id.toString() !== educationId
    );
    await jobSeeker.save();

    // Delete the education document
    await Education.findByIdAndDelete(educationId);

    // Get updated data with populated education
    const updatedJobSeeker = await JobSeeker.findById(jobSeeker._id)
      .populate({
        path: 'education',
        options: { sort: { 'batchYear.start': -1 } }
      });

    return res.status(200).json({
      success: true,
      education: updatedJobSeeker.education
    });

  } catch (error) {
    console.error('Error in deleteEducation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add Skills functions
const getSkills = async (req, res) => {
  try {
    const userId = req.user?._id;
    const jobSeeker = await JobSeeker.findOne({ user: userId });
    
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      skills: jobSeeker.keySkills || []
    });
  } catch (error) {
    console.error('Error in getSkills:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateSkills = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { skills } = req.body;

    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update the keySkills array
    jobSeeker.keySkills = skills;
    await jobSeeker.save();

    return res.status(200).json({
      success: true,
      skills: jobSeeker.keySkills
    });
  } catch (error) {
    console.error('Error in updateSkills:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add this new function to get specific work experience
const getWorkExperienceById = async (req, res) => {
  try {
    const userId = req.user?._id;
    const workExpId = req.params.id;

    // First verify this work experience belongs to the user
    const jobSeeker = await JobSeeker.findOne({ 
      user: userId,
      workExperience: workExpId 
    });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found or access denied'
      });
    }

    // Fetch the specific work experience
    const workExperience = await WorkExperience.findById(workExpId);

    if (!workExperience) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }

    return res.status(200).json({
      success: true,
      workExperience
    });

  } catch (error) {
    console.error('Error in getWorkExperienceById:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update work experience
const updateWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedExp = await WorkExperience.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedExp) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }

    return res.status(200).json({
      success: true,
      workExperience: updatedExp
    });
  } catch (error) {
    console.error('Error in updateWorkExperience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update education
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Create update object based on education level
    const updateDoc = {
      educationalLevel: updates.educationalLevel,
      schoolName: updates.schoolName,
      batchYear: updates.batchYear
    };

    // Add level-specific fields
    if (updates.educationalLevel === 'High School') {
      updateDoc.highSchool = updates.highSchool;
      updateDoc.college = undefined;
      updateDoc.certificate = undefined;
    } else if (updates.educationalLevel === 'Certificate') {
      updateDoc.certificate = updates.certificate;
      updateDoc.college = undefined;
      updateDoc.highSchool = undefined;
    } else if (['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(updates.educationalLevel)) {
      updateDoc.college = updates.college;
      updateDoc.highSchool = undefined;
      updateDoc.certificate = undefined;
    }

    const updatedEdu = await Education.findByIdAndUpdate(
      id,
      updateDoc,
      { new: true, runValidators: true }
    );

    if (!updatedEdu) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    return res.status(200).json({
      success: true,
      education: updatedEdu
    });
  } catch (error) {
    console.error('Error in updateEducation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Add this controller function
export const uploadDocument = async (req, res) => {
  try {
    const { type } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Update the jobseeker's document
    const jobSeeker = await JobSeeker.findOne({ user: req.user._id });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update the appropriate document field
    jobSeeker.documents[type] = {
      path: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype
    };

    await jobSeeker.save();

    return res.status(200).json({
      success: true,
      file: {
        path: file.path,
        originalName: file.originalname
      }
    });

  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
};

// Add this new controller function
export const getJobSeekerProfileForEmployer = async (req, res) => {
  try {
    const { seekerId } = req.params;
    
    console.log('Fetching profile for seekerId:', seekerId); // Debug log

    // Validate seekerId
    if (!seekerId || !mongoose.Types.ObjectId.isValid(seekerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seeker ID provided'
      });
    }

    const jobSeeker = await JobSeeker.findOne({ user: seekerId })
      .populate('user', '-password')
      .populate('basicInfo')
      .populate('locationInfo')
      .populate('workExperience')
      .populate('education')
      .populate('disabilityInfo');

    console.log('Found jobSeeker:', jobSeeker ? 'Yes' : 'No'); // Debug log

    if (!jobSeeker) {
      // Try finding by _id instead of user field
      const jobSeekerById = await JobSeeker.findById(seekerId)
        .populate('user', '-password')
        .populate('basicInfo')
        .populate('locationInfo')
        .populate('workExperience')
        .populate('education')
        .populate('disabilityInfo');

      console.log('Found jobSeekerById:', jobSeekerById ? 'Yes' : 'No'); // Debug log

      if (!jobSeekerById) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile: jobSeekerById
      });
    }

    return res.status(200).json({
      success: true,
      profile: jobSeeker
    });

  } catch (error) {
    console.error('Error in getJobSeekerProfileForEmployer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// At the end of the file, update the exports:
export {
  getUserProfile,
  updateBasicInfo,
  updateLocationInfo,
  // Work Experience
  getWorkExperience,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getWorkExperienceById,
  // Education
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  // Skills
  getSkills,
  updateSkills
};