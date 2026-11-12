import axios from 'axios';

const axiosInstance = axios.create({
  // Empty in production: Nginx serves the app and /api from the same host
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
