export const getToken = async () => {
  try {
    const response = await fetch('/api/video/get-token', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get token');
    }
    
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

export const createMeeting = async () => {
  try {
    const response = await fetch('/api/video/create-meeting', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create meeting');
    }

    const { roomId } = await response.json();
    return roomId;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const validateMeeting = async (meetingId) => {
  try {
    const response = await fetch(`/api/video/validate/${meetingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate meeting');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating meeting:', error);
    throw error;
  }
}; 