import { User, Admin, Employer, CompanyInfo, ContactPerson, PWDSupport, JobSeeker } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Job from '../models/job.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';
import { sendVerificationEmail } from '../utils/emailService.js';
import { logActivity } from '../utils/activityLogger.js';

dotenv.config();

export const registerAdmin = async (req, res) => {
    try {
        const { email, accessLevel, permissions } = req.body;

        // Check if admin already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if there's a pending admin invitation
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'An invitation has already been sent to this email' });
        }

        // Create verification token
        const verificationToken = jwt.sign(
            { email, accessLevel, permissions },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log the token for debugging
        console.log('Generated verification token:', verificationToken);

        // Create temporary admin record
        const tempAdmin = await Admin.create({
            email,
            accessLevel,
            permissions,
            verificationToken,
            verificationExpires: Date.now() + 24 * 60 * 60 * 1000,
            status: 'pending',
            createdBy: req.user._id
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken);
        console.log('Email sending result:', emailSent);

        if (!emailSent) {
            console.error('Failed to send verification email');
            await Admin.findByIdAndDelete(tempAdmin._id);
            return res.status(500).json({ 
                success: false,
                message: 'Failed to send verification email. Please try again later.',
                error: 'Email service error'
            });
        }

        await logActivity(req.user._id, 'ADMIN_CREATED', {
            newAdminId: tempAdmin._id,
            email: email,
            accessLevel: accessLevel
        }, req);

        res.status(201).json({
            success: true,
            message: 'Admin invitation sent successfully',
            data: tempAdmin
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating admin account',
            error: error.message 
        });
    }
};

export const verifyEmailAndSetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Find the pending admin invitation
        const pendingAdmin = await Admin.findOne({ 
            verificationToken: token,
            verificationExpires: { $gt: Date.now() },
            status: 'pending'
        });

        if (!pendingAdmin) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user account
        const user = await User.create({
            email: pendingAdmin.email,
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        // Update admin record
        pendingAdmin.user = user._id;
        pendingAdmin.status = 'active';
        pendingAdmin.verificationToken = undefined;
        pendingAdmin.verificationExpires = undefined;
        await pendingAdmin.save();

        res.status(200).json({
            success: true,
            message: 'Email verified and password set successfully'
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can log in.' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get admin details
    const adminDetails = await Admin.findOne({ user: user._id });
    if (!adminDetails) {
      return res.status(403).json({ message: 'Admin account not found' });
    }

    // Generate a token with additional admin info
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        isVerified: user.isVerified,
        accessLevel: adminDetails.accessLevel,
        permissions: adminDetails.permissions
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Set cookie with proper options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost'
    });

    // Update last login time for admin
    await Admin.updateOne({ user: user._id }, { lastLogin: Date.now() });

    // Return success response with user info
    return res.status(200).json({ 
      success: true,
      message: 'Login successful',
      userId: user._id,
      role: user.role,
      accessLevel: adminDetails.accessLevel,
      permissions: adminDetails.permissions,
      token // Include token in response for localStorage backup
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = 'createdAt',
      sortDirection = 'desc',
      status,
      search,
      industry,
      jobType,
      location
    } = req.query;

    // Build query
    let query = {};

    // Status filter
    if (status && status !== 'all') {
      query.jobStatus = status.toLowerCase();
    }

    // Search filter (search in title and description)
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { jobDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Industry filter
    if (industry && industry !== 'all') {
      query.industry = industry;
    }

    // Job type filter
    if (jobType && jobType !== 'all') {
      query.employmentType = jobType;
    }

    // Location filter
    if (location && location !== 'all') {
      query.jobLocation = { $regex: location, $options: 'i' };
    }

    // Handle sorting
    const sortOptions = {
      [sortField]: sortDirection === 'asc' ? 1 : -1
    };

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Get company info for each job
    const jobsWithCompanyInfo = await Promise.all(jobs.map(async (job) => {
      const employer = await Employer.findOne({ user: job.employersId });
      const companyInfo = employer ? await CompanyInfo.findById(employer.companyInfo) : null;

      return {
        ...job.toObject(),
        employerDetails: {
          companyName: companyInfo?.companyName || 'N/A'
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: jobsWithCompanyInfo,
      total,
      perPage: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

export const reviewJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate('employersId', 'companyName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job details',
      error: error.message
    });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, message, type } = req.body;

    const job = await Job.findById(jobId).populate('employersId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Update job status
    job.jobStatus = status;
    await job.save();

    // Create notification with the correct type
    const notification = new Notification({
      userId: job.employersId._id,
      title: `Job ${status === 'active' ? 'Approved' : 'Declined'}`,
      message: message,
      type: type,
      referenceId: job._id
    });

    await notification.save();

    return res.status(200).json({
      success: true,
      message: `Job has been ${status}`,
      data: job
    });

  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message
    });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const jobs = await Job.find();
    
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.jobStatus === 'active').length,
      pendingJobs: jobs.filter(job => job.jobStatus === 'pending').length
    };

    console.log('Calculated job stats:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message
    });
  }
};

export const getUserForReview = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Reviewing user ID:', userId);
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', user);

    let userData = { ...user._doc };

    if (user.role === 'employer') {
      console.log('Fetching employer data...');
      // Fetch employer data directly without using populate for documents
      const employer = await Employer.findOne({ user: userId });
      console.log('Raw employer data:', JSON.stringify(employer, null, 2));

      if (employer) {
        console.log('Found employer, fetching related data...');
        // Fetch related data
        const [companyInfo, contactPerson, pwdSupport] = await Promise.all([
          CompanyInfo.findById(employer.companyInfo),
          ContactPerson.findById(employer.contactPerson),
          PWDSupport.findById(employer.pwdSupport)
        ]);

        // Convert to plain objects and add documents
        const plainEmployer = employer.toObject();
        console.log('Plain employer object:', JSON.stringify(plainEmployer, null, 2));

        userData = {
          ...userData,
          companyInfo: companyInfo?.toObject(),
          contactPerson: contactPerson?.toObject(),
          pwdSupport: pwdSupport?.toObject(),
          documents: plainEmployer.documents // Get documents directly from employer
        };

        console.log('Documents being added:', JSON.stringify(plainEmployer.documents, null, 2));
      }
    } else if (user.role === 'jobseeker') {
      // Fetch job seeker data with documents
      const jobSeeker = await JobSeeker.findOne({ user: userId })
        .populate('basicInfo')
        .populate('locationInfo')
        .populate('disabilityInfo')
        .populate('workPreferences')
        .lean();

      if (jobSeeker) {
        userData = {
          ...userData,
          basicInfo: jobSeeker.basicInfo,
          locationInfo: jobSeeker.locationInfo,
          disabilityInfo: jobSeeker.disabilityInfo,
          workPreferences: jobSeeker.workPreferences,
          documents: jobSeeker.documents || {}
        };
      }
    }

    console.log('Final user data:', JSON.stringify(userData, null, 2));
    res.json(userData);

  } catch (error) {
    console.error('Error in getUserForReview:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified, sendEmail } = req.body;
    
    // Update user verification status
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If verifying user and sendEmail is true, send verification email
    if (isVerified && sendEmail) {
      // Generate verification link (you might want to use your frontend URL)
      const verificationLink = `${process.env.FRONTEND_URL}/login`;
      
      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Your Account Has Been Verified',
        html: `
          <h1>Account Verified</h1>
          <p>Dear ${user.profile?.basicInfo?.name || 'User'},</p>
          <p>Your account has been verified by our administrators. You can now access all features of our platform.</p>
          <p>Click the link below to login:</p>
          <a href="${verificationLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Login to Your Account
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationLink}</p>
          <p>Thank you for joining our platform!</p>
        `
      });
    }

    res.status(200).json({ 
      message: isVerified ? 'User verified successfully' : 'User unverified successfully',
      user 
    });
  } catch (error) {
    console.error('Error in verifyUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('user', 'email')
      .populate('createdBy', 'email');

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('user', 'email')
      .populate('createdBy', 'email');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { accessLevel, permissions, status } = req.body;
    const adminToUpdate = await Admin.findById(req.params.id);

    if (!adminToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent modifying super_admin unless you're a super_admin
    const requestingAdmin = await Admin.findOne({ user: req.user._id });
    if (adminToUpdate.accessLevel === 'super_admin' && 
        requestingAdmin.accessLevel !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin permissions'
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        accessLevel,
        permissions,
        status
      },
      { new: true }
    );

    await logActivity(req.user._id, 'ADMIN_UPDATED', {
      adminId: req.params.id,
      changes: {
        accessLevel,
        status,
        permissions
      }
    }, req);

    res.status(200).json({
      success: true,
      data: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id);

    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deleting super_admin
    if (adminToDelete.accessLevel === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    // Delete the admin and associated user
    await Promise.all([
      Admin.findByIdAndDelete(req.params.id),
      User.findByIdAndDelete(adminToDelete.user)
    ]);

    await logActivity(req.user._id, 'ADMIN_DELETED', {
      deletedAdminId: req.params.id
    }, req);

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};

export const updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const adminToUpdate = await Admin.findById(req.params.id);

    if (!adminToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent modifying super_admin permissions
    if (adminToUpdate.accessLevel === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin permissions'
      });
    }

    adminToUpdate.permissions = permissions;
    await adminToUpdate.save();

    res.status(200).json({
      success: true,
      data: adminToUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.user._id })
      .populate('user', 'email')
      .populate('createdBy', 'email');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    // Get additional stats if admin has view_analytics permission
    let additionalData = {};
    if (admin.permissions.includes('view_analytics')) {
      const [usersCount, jobsCount, employersCount] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Employer.countDocuments()
      ]);

      additionalData = {
        stats: {
          totalUsers: usersCount,
          totalJobs: jobsCount,
          totalEmployers: employersCount
        }
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...admin.toObject(),
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile',
      error: error.message
    });
  }
};

// Add a function to update admin status
export const updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const adminToUpdate = await Admin.findById(req.params.id);

    if (!adminToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent modifying super_admin status
    if (adminToUpdate.accessLevel === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin status'
      });
    }

    adminToUpdate.status = status;
    await adminToUpdate.save();

    res.status(200).json({
      success: true,
      data: adminToUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin status',
      error: error.message
    });
  }
};
