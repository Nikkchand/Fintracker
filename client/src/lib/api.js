import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add a mock token
api.interceptors.request.use(
  async (config) => {
    // Backend doesn't verify this anymore, just adding it to not break format expectations if any
    config.headers.Authorization = `Bearer mock-token-123`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
