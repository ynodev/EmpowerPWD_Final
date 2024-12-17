import express from 'express';
import { VideoSDK } from '@videosdk.live/node-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize VideoSDK with the correct environment variables
const videoSDK = new VideoSDK({
  apiKey: process.env.VIDEOSDK_API_KEY,
  apiSecret: process.env.VIDEOSDK_SECRET_KEY
});

// Add token generation endpoint
router.get('/token', (req, res) => {
  console.log('Token generation request received');
  try {
    // Generate token with specific permissions and expiry
    const token = videoSDK.generateToken({
      permissions: ["allow_join", "allow_mod"], // Basic permissions
      expiresIn: "24h" // Token validity
    });
    
    console.log('Generated token:', token); // Debug log
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
});

router.get('/:meetingId/status', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }

    // Try to validate the meeting exists
    const meetingInfo = await videoSDK.validateMeeting(meetingId);
    
    res.json({
      meetingId,
      participantCount: meetingInfo?.participants?.length || 0,
      isActive: true
    });
  } catch (error) {
    console.error('Error getting meeting status:', error);
    // Return a safe fallback response
    res.json({
      meetingId: req.params.meetingId,
      participantCount: 0,
      isActive: true
    });
  }
});

// Add a debug endpoint to check environment variables
router.get('/debug/config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.VIDEOSDK_API_KEY,
    hasSecretKey: !!process.env.VIDEOSDK_SECRET_KEY,
    // Don't send actual values for security
  });
});

export default router; 