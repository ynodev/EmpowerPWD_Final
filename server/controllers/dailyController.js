import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const createRoom = async (req, res) => {
  try {
    const { properties } = req.body;

    // Default properties without recording (which requires a paid plan)
    const roomProperties = {
      exp: Math.round(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
      enable_chat: true,
      enable_screenshare: true,
      start_audio_off: true,
      start_video_off: true,
      max_participants: 10,
      enable_knocking: true,
      // removed enable_recording as it requires a paid plan
    };

    // Generate a unique room name
    const roomName = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        name: roomName,
        properties: roomProperties
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`
        }
      }
    );

    console.log('Daily.co response:', response.data);

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error creating Daily.co room:', error.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting room',
      error: error.response?.data || error.message
    });
  }
};

// Export as a named export instead of using module.exports
export default {
  createRoom
};