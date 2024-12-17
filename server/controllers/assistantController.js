import { User, JobSeeker, AssistantSchema, BasicInfo, LocationInfo, DisabilityInfo, WorkPreferences } from '../models/userModel.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { tempRegistrations } from './otpController.js';

// Create the Assistant model
const Assistant = mongoose.model('Assistant', AssistantSchema);

export const assistantController = {
  // Register a new assistant
  registerAssistant: async (req, res) => {
    try {
      // Assistant information
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        relationship,
        otherRelationship,
        
        // Job Seeker's Basic Info
        seekerFirstName,
        seekerLastName,
        dateOfBirth,
        gender,
        age,
        seekerPhoneNumber,
        
        // Job Seeker's Location Info
        country,
        region,
        province,
        barangay,
        city,
        postal,
        address,
        
        // Job Seeker's Disability Info
        disabilityType,
        disabilityAdditionalInfo,
        
        // Job Seeker's Work Preferences
        preferredJobTitles,
        industry,
        employmentType
      } = req.body;

      // Check if email exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Verify if the email was previously verified through OTP
      const isEmailVerified = tempRegistrations.has(email) || 
                             await User.findOne({ email, isEmailVerified: true });
      
      if (!isEmailVerified) {
        console.log('Email not verified:', email);
        return res.status(400).json({
          success: false,
          message: 'Email verification required'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create only one User account
      const user = new User({
        email,
        password: hashedPassword,
        role: 'jobseeker',
        isAssistant: true,
        isEmailVerified: true
      });
      await user.save();

      // 3. Create BasicInfo for job seeker
      const basicInfo = await BasicInfo.create({
        firstName: seekerFirstName,
        lastName: seekerLastName,
        dateOfBirth,
        gender,
        age: parseInt(age),
        phoneNumber: seekerPhoneNumber,
      });

      // 4. Create LocationInfo
      const locationInfo = await LocationInfo.create({
        country,
        region,
        province,
        barangay,
        city,
        postal,
        address
      });

      // 5. Create DisabilityInfo
      const disabilityInfo = await DisabilityInfo.create({
        disabilityType: Array.isArray(disabilityType) ? disabilityType : JSON.parse(disabilityType || '[]'),
        disabilityAdditionalInfo
      });

      // 6. Create WorkPreferences
      const workPreferences = await WorkPreferences.create({
        preferredJobTitles: Array.isArray(preferredJobTitles) ? preferredJobTitles : JSON.parse(preferredJobTitles || '[]'),
        industry: Array.isArray(industry) ? industry : JSON.parse(industry || '[]'),
        employmentType
      });

      // Create JobSeeker profile linked to the same user
      const jobSeeker = await JobSeeker.create({
        user: user._id,  // Use the same user ID
        basicInfo: basicInfo._id,
        locationInfo: locationInfo._id,
        disabilityInfo: disabilityInfo._id,
        workPreferences: workPreferences._id,
        documents: req.files ? {
          pwdId: req.files.pwdId ? {
            path: req.files.pwdId[0].path,
            originalName: req.files.pwdId[0].originalname,
            mimeType: req.files.pwdId[0].mimetype
          } : undefined,
          validId: req.files.validId ? {
            path: req.files.validId[0].path,
            originalName: req.files.validId[0].originalname,
            mimeType: req.files.validId[0].mimetype
          } : undefined
        } : {}
      });

      // Create Assistant profile linked to the same user
      const assistant = new Assistant({
        user: user._id,  // Use the same user ID
        jobSeeker: jobSeeker._id,
        role: relationship === 'Other' ? otherRelationship : relationship,
        basicInfo: {
          firstName,
          lastName,
          phoneNumber,
          relationship: relationship === 'Other' ? otherRelationship : relationship
        },
        verificationDocument: req.file ? {
          path: req.file.path,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype
        } : null
      });
      await assistant.save();

      // Remove temporary registration data
      tempRegistrations.delete(email);

      res.status(201).json({
        success: true,
        message: 'Assistant and Job Seeker profiles created successfully',
        data: {
          assistant,
          jobSeeker
        }
      });

    } catch (error) {
      console.error('Error registering assistant:', error);
      
      // If there's an error, attempt to clean up any created documents
      try {
        if (user?._id) await User.findByIdAndDelete(user._id);
        if (basicInfo?._id) await BasicInfo.findByIdAndDelete(basicInfo._id);
        if (locationInfo?._id) await LocationInfo.findByIdAndDelete(locationInfo._id);
        if (disabilityInfo?._id) await DisabilityInfo.findByIdAndDelete(disabilityInfo._id);
        if (workPreferences?._id) await WorkPreferences.findByIdAndDelete(workPreferences._id);
        if (jobSeeker?._id) await JobSeeker.findByIdAndDelete(jobSeeker._id);
        if (assistant?._id) await Assistant.findByIdAndDelete(assistant._id);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to register assistant and job seeker'
      });
    }
  },

  // Get assistant details
  getAssistant: async (req, res) => {
    try {
      const assistant = await Assistant.findOne({ user: req.user._id })
        .populate('jobSeeker')
        .populate('user', '-password');

      if (!assistant) {
        return res.status(404).json({
          success: false,
          message: 'Assistant not found'
        });
      }

      res.status(200).json({
        success: true,
        assistant
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update assistant profile
  updateAssistant: async (req, res) => {
    try {
      const { basicInfo, role } = req.body;
      
      const assistant = await Assistant.findOne({ user: req.user._id });
      if (!assistant) {
        return res.status(404).json({
          success: false,
          message: 'Assistant not found'
        });
      }

      // Update verification document if provided
      if (req.file) {
        assistant.verificationDocument = {
          path: req.file.path,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype
        };
      }

      // Update other fields
      if (basicInfo) assistant.basicInfo = basicInfo;
      if (role) assistant.role = role;

      await assistant.save();

      res.status(200).json({
        success: true,
        message: 'Assistant profile updated successfully',
        assistant
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all assistants for a specific job seeker
  getJobSeekerAssistants: async (req, res) => {
    try {
      const { jobSeekerId } = req.params;

      const assistants = await Assistant.find({ jobSeeker: jobSeekerId })
        .populate('user', '-password')
        .select('-verificationDocument');

      res.status(200).json({
        success: true,
        assistants
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Remove assistant
  removeAssistant: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { assistantId } = req.params;

      const assistant = await Assistant.findById(assistantId);
      if (!assistant) {
        throw new Error('Assistant not found');
      }

      // Remove assistant profile
      await Assistant.findByIdAndDelete(assistantId, { session });

      // Update user isAssistant flag
      await User.findByIdAndUpdate(
        assistant.user,
        { isAssistant: false },
        { session }
      );

      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: 'Assistant removed successfully'
      });

    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  },

  // Verify assistant document
  verifyAssistantDocument: async (req, res) => {
    try {
      const { assistantId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document provided'
        });
      }

      const assistant = await Assistant.findById(assistantId);
      if (!assistant) {
        return res.status(404).json({
          success: false,
          message: 'Assistant not found'
        });
      }

      assistant.verificationDocument = {
        path: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      };
      
      await assistant.save();

      res.status(200).json({
        success: true,
        message: 'Verification document updated successfully',
        assistant
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default assistantController;
