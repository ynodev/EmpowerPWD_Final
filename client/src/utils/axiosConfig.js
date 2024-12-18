import api, { requests, auth } from './axios';

// Using the requests helper
const fetchData = async () => {
  try {
    const response = await requests.get('/api/some-endpoint');
    // Handle response
  } catch (error) {
    // Handle error
  }
};

// Using auth helpers
const login = async (credentials) => {
  try {
    const response = await requests.post('/api/auth/login', credentials);
    if (response.data.token) {
      auth.setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    // Handle error
  }
};

// Or using the api instance directly
const customRequest = async () => {
  try {
    const response = await api.get('/api/custom', {
      // Custom config
      headers: {
        'Custom-Header': 'value'
      }
    });
    // Handle response
  } catch (error) {
    // Handle error
  }
};
