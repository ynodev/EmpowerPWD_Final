import jwt from 'jsonwebtoken';
import { User, JobSeeker, Employer, Admin } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Cookies:', req.cookies);
    console.log('Auth Middleware - Headers:', req.headers);

    // Get token from cookie
    let token = req.cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'No authentication token found'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      });
    }

    // Fetch user data
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for id:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user data to request
    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    };

    console.log('Auth successful for user:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
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


