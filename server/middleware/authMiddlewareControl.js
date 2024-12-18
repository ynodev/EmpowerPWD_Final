import jwt from 'jsonwebtoken';
import { User, JobSeeker, Employer, Admin } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // Fallback to cookie if no header token
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token found'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and attach to request
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
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
