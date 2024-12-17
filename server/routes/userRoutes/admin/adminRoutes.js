import express from 'express';
import { 
  registerAdmin, 
  loginAdmin, 
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  updateAdminPermissions,
  updateAdminStatus,
  getAdminProfile,
  getAllJobs,
  getUserForReview,
  verifyEmailAndSetPassword
} from '../../../controllers/adminController.js';
import { authMiddleware, roleMiddleware, permissionMiddleware } from '../../../middleware/authMiddlewareControl.js';
import { Admin, ActivityLog } from '../../../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../../../utils/emailService.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Add this line to store reset attempts
const resetAttempts = new Map();

// Clean up old entries periodically (every hour)
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [key, timestamp] of resetAttempts) {
        if (timestamp < oneHourAgo) {
            resetAttempts.delete(key);
        }
    }
}, 3600000); // Run every hour

// Public routes
router.post('/login', loginAdmin);
router.post('/verify-email', verifyEmailAndSetPassword);
router.post('/verify-email-exists', async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        
        res.json({
            success: true,
            exists: !!admin,
            message: admin 
                ? 'Email found in admin records'
                : 'No administrator account found with this email'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email'
        });
    }
});

// Add these routes to public section
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check rate limiting
        const lastAttempt = resetAttempts.get(email);
        const now = Date.now();
        if (lastAttempt && (now - lastAttempt) < 60000) { // 60 seconds
            return res.status(429).json({
                success: false,
                message: 'Please wait 60 seconds before requesting another reset link'
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Update rate limiting
        resetAttempts.set(email, now);

        // Generate reset token
        const resetToken = jwt.sign(
            { adminId: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Save reset token to admin
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        await admin.save();

        // Send reset email
        await sendPasswordResetEmail(email, resetToken);

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request'
        });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // First verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is invalid or has expired'
            });
        }

        // Then find the admin
        const admin = await Admin.findOne({
            _id: decoded.adminId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired or admin not found'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        admin.password = hashedPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            details: error.message
        });
    }
});

// Protected admin routes - everything below this requires authentication
router.use(authMiddleware, roleMiddleware('admin'));

// Super admin only routes
router.post('/register', permissionMiddleware('manage_admins'), registerAdmin);
router.get('/admins', permissionMiddleware('manage_admins'), getAllAdmins);
router.get('/admins/:id', permissionMiddleware('manage_admins'), getAdminById);
router.put('/admins/:id', permissionMiddleware('manage_admins'), updateAdmin);
router.delete('/admins/:id', permissionMiddleware('manage_admins'), deleteAdmin);
router.put('/admins/:id/permissions', permissionMiddleware('manage_admins'), updateAdminPermissions);
router.put('/admins/:id/status', permissionMiddleware('manage_admins'), updateAdminStatus);

// Admin profile route
router.get('/profile', getAdminProfile);

// Other admin routes
router.get('/jobs', permissionMiddleware('manage_jobs'), getAllJobs);
router.get('/management/users/:userId/review', permissionMiddleware('manage_users'), getUserForReview);

router.get('/activity-logs', 
  authMiddleware, 
  roleMiddleware('admin'),
  permissionMiddleware('view_analytics'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { action: new RegExp(search, 'i') },
            { 'details.email': new RegExp(search, 'i') },
            { ipAddress: new RegExp(search, 'i') }
          ]
        };
      }

      const logs = await ActivityLog.find(query)
        .populate('admin', 'email')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await ActivityLog.countDocuments(query);

      res.json({
        success: true,
        data: logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching activity logs',
        error: error.message
      });
    }
  }
);

// Update permissions for a specific role
router.put('/roles/:roleName/permissions', 
  authMiddleware, 
  roleMiddleware('admin'), 
  permissionMiddleware('manage_admins'), 
  async (req, res) => {
    try {
      const { roleName } = req.params;
      const { permissions } = req.body;

      // Find all admins with this role and update their permissions
      const updatedAdmins = await Admin.updateMany(
        { accessLevel: roleName },
        { $set: { permissions } }
      );

      res.json({
        success: true,
        message: `Updated permissions for ${roleName} role`,
        data: updatedAdmins
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating role permissions',
        error: error.message
      });
    }
  }
);

export default router;