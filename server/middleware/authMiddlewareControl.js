// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User, JobSeeker, Employer, Admin } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      });
    }

    // Fetch user data
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user data to the request
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      isVerified: decoded.isVerified,
    };

    // Fetch role-specific data
    if (user.role === 'jobseeker') {
      const jobSeekerProfile = await JobSeeker.findOne({ user: user._id })
        .populate('basicInfo locationInfo disabilityInfo workPreferences');
      req.user.profile = jobSeekerProfile;
    } else if (user.role === 'employer') {
      const employerProfile = await Employer.findOne({ user: user._id })
        .populate('companyInfo contactPerson pwdSupport');
      req.user.profile = employerProfile;
    } else if (user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: user._id });
      req.user.profile = adminProfile;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication',
    });
  }
};

// Middleware to restrict access based on roles
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

export const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findOne({ user: req.user._id });
      
      if (!admin) {
        return res.status(403).json({ message: 'Admin profile not found' });
      }

      // Super admins bypass permission checks
      if (admin.accessLevel === 'super_admin') {
        return next();
      }

      // Check if admin has required permission
      if (!admin.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

export default authMiddleware;
