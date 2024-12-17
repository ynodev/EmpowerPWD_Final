import { User, JobSeeker, Employer, Admin, CompanyUser, ActivityLog, CompanyInfo } from '../models/userModel.js';

// Helper function to verify admin access
const verifyAdminAccess = async (req) => {
  // Get user ID from authenticated session
  const userId = req.user?._id; // Assuming you set req.user in your auth middleware
  if (!userId) {
    throw new Error('Unauthorized - No user ID found');
  }


  // Verify user is admin
  const admin = await User.findOne({ _id: userId, role: 'admin' });
  if (!admin) {
    throw new Error('Forbidden - Admin access required');
  }
  return true;
};

export const userController = {
  // Get all users with pagination and filtering
  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('Fetching user:', userId); // Debug log
      
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let detailedUserData = {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      if (user.role === 'employer') {
        // Find employer data and explicitly populate company info
        const employerData = await Employer.findOne({ user: userId })
          .populate({
            path: 'companyInfo',
            model: 'CompanyInfo',
            select: 'companyName industry companySize website companyAddress companyDescription establishmentDate documents' // Explicitly include documents
          })
          .populate('contactPerson');

        console.log('Employer data:', JSON.stringify(employerData, null, 2)); // Debug log

        if (employerData && employerData.companyInfo) {
          detailedUserData = {
            ...detailedUserData,
            companyInfo: employerData.companyInfo,
            contactPerson: employerData.contactPerson
          };
        }
      }

      console.log('Detailed user data:', JSON.stringify(detailedUserData, null, 2)); // Debug log
      res.json(detailedUserData);

    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      await verifyAdminAccess(req);

      const { 
        page = 1, 
        limit = 10, 
        role = 'all', 
        search = '', 
        verified = 'all',
        sortBy = 'createdAt',
        order = 'desc' 
      } = req.query;

      // Build filter object
      const filter = {};
      
      // Role filter
      if (role && role !== 'all') {
        filter.role = role;
      }

      // Verification status filter
      if (verified !== 'all') {
        // If verified is 'pending', show unverified users (isVerified: false)
        // If verified is 'verified', show verified users (isVerified: true)
        filter.isVerified = verified === 'verified';
      }

      // If verified is 'pending', we want unverified users
      if (verified === 'pending') {
        filter.isVerified = false;
      }

      // Search filter
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Add back the pagination and sort variables
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

      console.log('Filter:', filter); // Debug log

      // Fetch users without population
      const users = await User.find(filter)
        .sort(sort)  // Now sort is defined
        .skip(skip)  // Now skip is defined
        .limit(parseInt(limit))
        .select('-password');

      // Get total count for pagination
      const total = await User.countDocuments(filter);

      // Get basic stats
      const stats = {
        totalUsers: await User.countDocuments(),
        totalJobSeekers: await User.countDocuments({ role: 'jobseeker' }),
        totalEmployers: await User.countDocuments({ role: 'employer' }),
        pendingVerification: await User.countDocuments({ isVerified: false }),
        verifiedUsers: await User.countDocuments({ isVerified: true })
      };

      res.status(200).json({
        success: true,
        data: {
          users,
          stats,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            perPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching users',
        error: error.message 
      });
    }
  },

  // Get detailed user information
  getUserDetails: async (req, res) => {
    try {
      // Verify admin access first
      await verifyAdminAccess(req);

      const { userId } = req.params;

      // Fetch user without password
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch role-specific profile data
      let profile = null;
      let additionalData = {};

      if (user.role === 'jobseeker') {
        profile = await JobSeeker.findOne({ user: userId })
          .populate('basicInfo')
          .populate('education')
          .populate('experience')
          .populate('skills');
          
        // Get application statistics
        const applicationStats = await ApplicationLog.aggregate([
          { $match: { userId: user._id } },
          { 
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        
        additionalData.applicationStats = applicationStats;
      } 
      else if (user.role === 'employer') {
        profile = await Employer.findOne({ user: userId })
          .populate('companyInfo')
          .populate('team');
          
        // Get job posting statistics
        const jobStats = await JobPosting.aggregate([
          { $match: { employer: user._id } },
          { 
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        
        additionalData.jobStats = jobStats;
      }

      // Get recent activity logs
      const recentActivity = await ActivityLog.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(10);

      // Get account statistics
      const accountStats = {
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        lastUpdated: user.updatedAt,
        verificationStatus: user.isVerified,
        loginCount: user.loginCount || 0
      };

      res.status(200).json({
        user: {
          ...user.toObject(),
          profile: profile ? profile.toObject() : null,
          accountStats,
          recentActivity,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Error in getUserDetails:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ 
          message: error.message 
        });
      }
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ 
          message: error.message 
        });
      }
      res.status(500).json({ 
        message: 'Error fetching user details',
        error: error.message 
      });
    }
  },

  // Update user verification status
  updateVerificationStatus: async (req, res) => {
    try {
      // Verify admin access first
      await verifyAdminAccess(req);
  
      const { userId } = req.params;
      const { isVerified } = req.body;
  
      console.log(`Updating user ${userId} with verification status: ${isVerified}`);
  
      const user = await User.findByIdAndUpdate(
        userId,
        { isVerified },
        { new: true }
      ).select('-password');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Log the activity with required fields
      
  
      console.log('Updated user:', user);
  
      res.status(200).json({ 
        message: 'User verification status updated successfully',
        user 
      });
    } catch (error) {
      console.error('Error in updateVerificationStatus:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ 
          message: error.message 
        });
      }
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ 
          message: error.message 
        });
      }
      res.status(500).json({ 
        message: 'Error updating user verification status',
        error: error.message 
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      // Verify admin access first
      await verifyAdminAccess(req);

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete associated profile based on role
      if (user.role === 'jobseeker') {
        await JobSeeker.findOneAndDelete({ user: userId });
      } else if (user.role === 'employer') {
        await Employer.findOneAndDelete({ user: userId });
      }

      // Delete the user
      await User.findByIdAndDelete(userId);

      res.status(200).json({ 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ 
          message: error.message 
        });
      }
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ 
          message: error.message 
        });
      }
      res.status(500).json({ 
        message: 'Error deleting user',
        error: error.message 
      });
    }
  }
};