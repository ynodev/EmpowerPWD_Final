import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://empower-pwd.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Try cookie token first
    let token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    // Fallback to localStorage if no cookie token
    if (!token) {
      token = localStorage.getItem('token');
    }

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure credentials are always included
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear both cookie and localStorage
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.vercel.app; secure; samesite=none';
      localStorage.removeItem('token');
      
      // Redirect to login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error);
      // You might want to show a toast notification here
    }

    return Promise.reject(error);
  }
);

// Add request helpers
const requests = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config)
};

// Add auth helpers
const auth = {
  setToken: (token) => {
    localStorage.setItem('token', token);
    // Also set as cookie with secure options
    document.cookie = `token=${token}; path=/; secure; samesite=none`;
  },
  clearToken: () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.vercel.app; secure; samesite=none';
  },
  getToken: () => {
    // Try cookie first
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    // Fallback to localStorage
    return cookieToken || localStorage.getItem('token');
  }
};

// Export both the axios instance and helpers
export { api as default, requests, auth }; 
