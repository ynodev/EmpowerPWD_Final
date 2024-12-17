import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { sendOTPEmail } from '../config/emailConfig.js';
dotenv.config();

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Add verification
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP verification error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Generate OTP function
const generateNumericOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Update the email HTML template in both sendOTP and resendOTP functions
const createEmailTemplate = (otp) => `
  <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Logo -->
       <div style="text-align: center; margin-bottom: 30px;">
        <a href="https://imgbb.com/"><img src="https://i.ibb.co/Q9jtX3D/Group-1-1-1.png" alt="" border="0"></a>         
      <!-- Greeting -->
      <h2 style="color: #333; text-align: center; margin-bottom: 20px; font-size: 24px;">
        Verify Your Email Address
      </h2>
      
      <!-- Message -->
      <p style="color: #666; text-align: center; margin-bottom: 30px; font-size: 16px; line-height: 1.5;">
        Thank you for choosing <b>EmpowerPWD</b>. To complete your registration, please use the verification code below:
      </p>
      
      <!-- OTP Code -->
      <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 36px; letter-spacing: 8px; color: #000; margin: 0; font-weight: bold;">
          ${otp}
        </h1>
      </div>
      
      <!-- Timer Warning -->
      <p style="color: #666; text-align: center; margin-bottom: 30px; font-size: 14px;">
        This code will expire in <span style="color: #ff0000; font-weight: bold;">5 minutes</span>.
      </p>
      
      <!-- Additional Info -->
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
        <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.5;">
          If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} EmpowerPWD. All rights reserved.
        </p>
        <div style="margin-top: 10px;">
          <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
          <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
        </div>
      </div>
    </div>
  </div>
`;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export tempRegistrations so it can be used by other controllers
export const tempRegistrations = new Map();

// Update the sendOTP function
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

// Update the resendOTP function similarly
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists and last OTP was sent more than 1 minute ago
    const user = await User.findOne({ email });
    if (user && user.otpExpiry) {
      const timeSinceLastOTP = Date.now() - new Date(user.otpExpiry).getTime() + (5 * 60 * 1000);
      const oneMinuteInMs = 60 * 1000;
      
      if (timeSinceLastOTP < oneMinuteInMs) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 1 minute before requesting a new OTP'
        });
      }
    }

    // Generate new OTP
    const otp = generateNumericOTP();

    // Update user with new OTP
    await User.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      }
    );

    // Send email with updated template
    const mailOptions = {
        from: {
            name: 'EmpowerPWD',
            address: process.env.EMAIL_USER
          },
          to: email,
          subject: 'Verify Your Email - EmpowerPWD',
          html: createEmailTemplate(otp)
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully'
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// Verify OTP
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

// Send Forgot Password OTP
export const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = generateNumericOTP();
    console.log('Generated OTP:', otp);

    // Update user with forgot password OTP - FIXED: Use await and check for successful update
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {  // Explicitly use $set
          forgotPasswordOTP: otp,
          forgotPasswordOTPExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
        }
      },
      { 
        new: true,  // Return updated document
        runValidators: true  // Run model validations
      }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user with OTP');
    }

    console.log('Updated user:', {
      email: updatedUser.email,
      otp: updatedUser.forgotPasswordOTP,
      expiry: updatedUser.forgotPasswordOTPExpiry
    });

    // Send email
    const mailOptions = {
      from: {
        name: 'EmpowerPWD',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - EmpowerPWD',
      html: createEmailTemplate(otp)
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully'
    });

  } catch (error) {
    console.error('Error sending forgot password OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset OTP'
    });
  }
};

// Verify Forgot Password OTP
export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Received verification request:', { email, otp }); // Debugging line

    // Find the user
    const user = await User.findOne({ email });
    console.log('Found user:', user); // Debugging line

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the comparison
    console.log('Stored OTP:', user.forgotPasswordOTP);
    console.log('Received OTP:', otp);
    console.log('OTP Expiry:', user.forgotPasswordOTPExpiry);
    console.log('Current time:', new Date());

    // Check if OTP exists and matches
    if (!user.forgotPasswordOTP || user.forgotPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (!user.forgotPasswordOTPExpiry || new Date() > user.forgotPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Clear OTP after successful verification
    await User.findOneAndUpdate(
      { email },
      {
        $unset: { 
          forgotPasswordOTP: 1, 
          forgotPasswordOTPExpiry: 1 
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    });

  } catch (error) {
    console.error('Error verifying forgot password OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        $unset: { 
          forgotPasswordOTP: 1, 
          forgotPasswordOTPExpiry: 1 
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
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
 