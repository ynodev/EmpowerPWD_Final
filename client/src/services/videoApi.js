import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api/video';

export const createMeeting = async () => {
  try {
    const response = await fetch(`${BASE_URL}/create-meeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId: 'testUser' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Meeting created:', data);
    return data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const joinMeeting = async (meetingId) => {
  if (!meetingId) {
    throw new Error('Meeting ID is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/join/${meetingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId: 'testUser' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Joined meeting:', data);
    return data;
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

export const endMeeting = async (meetingId) => {
  if (!meetingId) {
    throw new Error('Meeting ID is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/end/${meetingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId: 'testUser' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Meeting ended:', data);
    return data;
  } catch (error) {
    console.error('Error ending meeting:', error);
    throw error;
  }
}; 