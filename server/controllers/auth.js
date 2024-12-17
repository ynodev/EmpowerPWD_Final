// controllers/auth.js
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { tempRegistrations } from './otpController.js';

dotenv.config();

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password!' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        isVerified: user.isVerified 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie options based on environment
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: 'none', // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    };

    // Set the cookie
    res.cookie('token', token, cookieOptions);

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Send token in response body
      userId: user._id,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Logout function
export const logout = (req, res) => {
  try {
    // Clear the cookie with the same options used to set it
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Logout failed. Please try again.' 
    });
  }
};

// Check authentication status
export const checkAuth = (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token found'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return res.status(200).json({
      success: true,
      userId: decoded.userId,
      role: decoded.role,
      isVerified: decoded.isVerified
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

// Email availability check
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user) {
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
    console.error('Email check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email'
    });
  }
};
