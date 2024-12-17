import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

export const videoApi = {
    generateToken: async () => {
        try {
            const response = await axios.post(`${BASE_URL}/video/get-token`);
            return response.data;
        } catch (error) {
            console.error('Token generation error:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate token');
        }
    },

    createMeeting: async (token) => {
        try {
            const response = await axios.post(`${BASE_URL}/video/create-meeting`, { token });
            return response.data;
        } catch (error) {
            console.error('Meeting creation error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create meeting');
        }
    }
}; 


