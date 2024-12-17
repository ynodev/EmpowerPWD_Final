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

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret key is missing');
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email,
        isVerified: user.isVerified // Add isVerified status to token
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in both cookie and response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Send token in response for localStorage
      userId: user._id,
      role: user.role,
      isVerified: user.isVerified // Send isVerified status in response
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message === 'JWT secret key is missing' ? 'Server configuration error' : 'Login failed. Please try again.' 
    });
  }
};

// Logout function
export const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Logout failed. Please try again.' });
  }
};

// Check authentication function
export const checkAuth = (req, res) => {
  try {
    const token = req.cookies.token;
    
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
      email: decoded.email,
      isVerified: decoded.isVerified // Include isVerified status in auth check
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid authentication token' 
    });
  }
};

// Email check function
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
    res.status(500).json({
      success: false,
      message: 'Error checking email'
    });
  }
};