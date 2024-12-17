import jwt from 'jsonwebtoken';
import { User, JobSeeker, Employer, Admin } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Check both cookie and Authorization header with improved token extraction
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({
        success: false,
        message: jwtError.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      });
    }

    // Fetch user data with error handling
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or deleted',
      });
    }

    // Attach basic user data to request
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
      isVerified: decoded.isVerified,
    };

    // Fetch role-specific profile data with proper error handling
    try {
      switch (user.role) {
        case 'jobseeker':
          const jobSeekerProfile = await JobSeeker.findOne({ user: user._id })
            .populate('basicInfo locationInfo disabilityInfo workPreferences');
          req.user.profile = jobSeekerProfile;
          break;
          
        case 'employer':
          const employerProfile = await Employer.findOne({ user: user._id })
            .populate('companyInfo contactPerson pwdSupport');
          req.user.profile = employerProfile;
          break;
          
        case 'admin':
          const adminProfile = await Admin.findOne({ user: user._id });
          req.user.profile = adminProfile;
          break;
      }
    } catch (profileError) {
      console.error('Profile fetch error:', profileError);
      // Continue even if profile fetch fails
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

// Role-based access control middleware
export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
      });
    }
    next();
  };
};

// Permission-based access control middleware
export const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findOne({ user: req.user._id });
      
      if (!admin) {
        return res.status(403).json({ 
          success: false,
          message: 'Admin profile not found' 
        });
      }

      // Super admins bypass permission checks
      if (admin.accessLevel === 'super_admin') {
        return next();
      }

      // Check specific permission
      if (!admin.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false,
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error checking permissions' 
      });
    }
  };
};

export default authMiddleware;
