import { 
  User, 
  BasicInfo, 
  LocationInfo, 
  DisabilityInfo, 
  WorkPreferences, 
  JobSeeker
} from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { handleJobSeekerDocuments } from '../utils/documentHandler.js';
import { tempRegistrations } from '../controllers/otpController.js';

export const createJobSeeker = async (req, res) => {
  // Declare variables at the top level of the function
  let user, basicInfo, locationInfo, disabilityInfo, workPreferences;

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      age,
      phoneNumber,
      country,
      region,
      province,
      barangay,
      city,
      postal,
      address,
      disabilityType,
      disabilityAdditionalInfo,
      preferredJobTitles,
      industry,
      employmentType
    } = req.body;

    // Validate required location fields
    if (!region || !province || !barangay || !city || !postal || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required location information',
        error: {
          region: !region ? 'Region is required' : undefined,
          province: !province ? 'Province is required' : undefined,
          city: !city ? 'City is required' : undefined,
          postal: !postal ? 'Postal code is required' : undefined,
          address: !address ? 'Address is required' : undefined,
          barangay: !barangay ? 'Barangay is required' : undefined
        }
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    try {
      // 1. Create User
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'jobseeker'
      });

      // 2. Create BasicInfo
      basicInfo = await BasicInfo.create({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        age: parseInt(age),
        phoneNumber
      });

      // 3. Create LocationInfo
      locationInfo = await LocationInfo.create({
        country,
        region,
        province,
        barangay,
        city,
        postal,
        address
      });

      // 4. Create DisabilityInfo
      disabilityInfo = await DisabilityInfo.create({
        disabilityType: Array.isArray(disabilityType) ? disabilityType : JSON.parse(disabilityType || '[]'),
        disabilityAdditionalInfo
      });

      // 5. Create WorkPreferences
      workPreferences = await WorkPreferences.create({
        preferredJobTitles: Array.isArray(preferredJobTitles) ? preferredJobTitles : JSON.parse(preferredJobTitles || '[]'),
        industry: Array.isArray(industry) ? industry : JSON.parse(industry || '[]'),
        employmentType
      });

      // 6. Handle document uploads
      const documentPaths = handleJobSeekerDocuments(req.files, email);

      // 7. Create JobSeeker with references
      const jobSeeker = await JobSeeker.create({
        user: user._id,
        basicInfo: basicInfo._id,
        locationInfo: locationInfo._id,
        disabilityInfo: disabilityInfo._id,
        workPreferences: workPreferences._id,
        documents: documentPaths
      });

      // Remove temporary registration data if it exists
      if (tempRegistrations.has(email)) {
        tempRegistrations.delete(email);
      }

      res.status(201).json({
        success: true,
        message: 'Job seeker created successfully',
        data: jobSeeker
      });

    } catch (error) {
      // Clean up any created documents if there's an error
      await cleanupDocuments(user, basicInfo, locationInfo, disabilityInfo, workPreferences);
      throw error; // Re-throw the error to be caught by the outer catch block
    }

  } catch (error) {
    console.error('Error creating job seeker:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job seeker',
      error: error.message
    });
  }
};

// Helper function to clean up documents
const cleanupDocuments = async (user, basicInfo, locationInfo, disabilityInfo, workPreferences) => {
  try {
    if (user) await User.findByIdAndDelete(user._id);
    if (basicInfo) await BasicInfo.findByIdAndDelete(basicInfo._id);
    if (locationInfo) await LocationInfo.findByIdAndDelete(locationInfo._id);
    if (disabilityInfo) await DisabilityInfo.findByIdAndDelete(disabilityInfo._id);
    if (workPreferences) await WorkPreferences.findByIdAndDelete(workPreferences._id);
  } catch (cleanupError) {
    console.error('Error during cleanup:', cleanupError);
  }
};

export const getJobSeekerById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const jobSeeker = await JobSeeker.findById(userId)
      .populate('user')
      .populate('basicInfo')
      .populate('locationInfo')
      .populate('disabilityInfo')
      .populate('workPreferences')
      .populate('additionalInfo');

    if (!jobSeeker) {
      return res.status(404).json({ error: 'JobSeeker not found' });
    }

    res.status(200).json(jobSeeker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateJobSeeker = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle document updates if files are included
    if (req.files && Object.keys(req.files).length > 0) {
      const documentPaths = handleJobSeekerDocuments(req.files, updateData.email);
      updateData.documents = documentPaths;
    }

    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job seeker updated successfully',
      data: jobSeeker
    });

  } catch (error) {
    console.error('Error updating job seeker:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job seeker',
      error: error.message
    });
  }
};

export const deleteJobSeeker = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.params.id);

    if (!jobSeeker) {
      return res.status(404).json({ error: 'Job Seeker not found' });
    }

    // Delete User, BasicInfo, and other nested documents
    await User.findByIdAndDelete(jobSeeker.user);
    await BasicInfo.findByIdAndDelete(jobSeeker.basicInfo);
    await LocationInfo.findByIdAndDelete(jobSeeker.locationInfo);
    await DisabilityInfo.findByIdAndDelete(jobSeeker.disabilityInfo);
    await WorkPreferences.findByIdAndDelete(jobSeeker.workPreferences);
    await JobSeekerAdditionalInfo.findByIdAndDelete(jobSeeker.additionalInfo);
    await JobSeeker.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Job Seeker deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
