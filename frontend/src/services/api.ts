import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pgsi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthenticated on a protected endpoint
      if (window.location.pathname !== '/login' && !error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('pgsi_token');
        localStorage.removeItem('pgsi_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
