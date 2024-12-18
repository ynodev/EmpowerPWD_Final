import express from 'express';
import { login, logout, checkAuth, checkEmail } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import { 
   sendOTP, 
   verifyOTP, 
   resendOTP,   
   sendForgotPasswordOTP, 
   verifyForgotPasswordOTP, 
   resetPassword  
} from '../controllers/otpController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/check', authMiddleware, checkAuth);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/check-email', checkEmail);
router.post('/send-forgot-password-otp', sendForgotPasswordOTP);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);
router.get('/check-auth', authMiddleware, (req, res) => {
  try {
    // If authMiddleware passes, user is authenticated
    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

export default router;
