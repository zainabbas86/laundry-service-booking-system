import axios from 'axios';
import { AUTH_STORAGE_KEY } from './context/AuthContext';

const axiosInstance = axios.create({
  // Empty in production: Nginx serves the app and /api from the same host
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

const readToken = () => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.token ? parsed.token : null;
  } catch (error) {
    return null;
  }
};

// Send the token on every request that has one.
axiosInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A rejected token means the session is over: clear it and go back to login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;
    const url = (error.config && error.config.url) || '';
    const isLoginAttempt = url.includes('/api/auth/login');

    if (status === 401 && !isLoginAttempt) {
      try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (storageError) {
        // Ignore storage failures.
      }
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
