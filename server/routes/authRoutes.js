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

export default router;