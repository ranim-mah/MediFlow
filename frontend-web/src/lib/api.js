import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach access token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediflow.accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap { success, data, message } envelope and surface clean errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || error.message || 'Network error';
    return Promise.reject({
      status: error.response?.status,
      message,
      details: payload?.details,
      raw: error,
    });
  }
);

export default api;
