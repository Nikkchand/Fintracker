import axios from 'axios';
import { auth } from '../services/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach real Firebase Auth ID token
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback check from stored user session if available
        const savedUser = localStorage.getItem('fintrakr_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.stsTokenManager?.accessToken) {
            config.headers.Authorization = `Bearer ${parsed.stsTokenManager.accessToken}`;
          } else if (parsed.uid) {
            // Send user UID token format for dev fallback
            config.headers.Authorization = `Bearer dev-uid-${parsed.uid}`;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID token:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthenticated:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
