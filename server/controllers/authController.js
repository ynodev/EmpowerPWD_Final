import { User } from '../models/userModel.js';
import { sendOTPEmail } from '../config/emailConfig.js';
import mongoose from 'mongoose';

// Create a temporary storage for registration data
const tempRegistrations = new Map();

// Add a function to check if email exists
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email is available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking email'
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store data temporarily
    tempRegistrations.set(email, {
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const tempData = tempRegistrations.get(email);
    if (!tempData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email'
      });
    }

    if (tempData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > tempData.otpExpiry) {
      tempRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // OTP is valid - keep the data for final registration
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Add cleanup function for expired temp registrations
setInterval(() => {
  const now = new Date();
  for (const [email, data] of tempRegistrations.entries()) {
    if (now > data.otpExpiry) {
      tempRegistrations.delete(email);
    }
  }
}, 60000); // Clean up every minute