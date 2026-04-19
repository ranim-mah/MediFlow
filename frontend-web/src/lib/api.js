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

// Simple token refresh mechanism — dedupes concurrent refreshes
let refreshing = null;
const refreshAccessToken = async () => {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const raw = localStorage.getItem('mediflow.auth');
    const refreshToken = raw ? JSON.parse(raw).state?.refreshToken : null;
    if (!refreshToken) throw new Error('No refresh token');
    const { data } = await axios.post(
      (import.meta.env.VITE_API_URL || '/api') + '/auth/refresh',
      { refreshToken }
    );
    const newToken = data.data.accessToken;
    localStorage.setItem('mediflow.accessToken', newToken);
    // Also update zustand-persisted state
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.accessToken = newToken;
      localStorage.setItem('mediflow.auth', JSON.stringify(parsed));
    }
    return newToken;
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
};

// Unwrap envelope + retry once on 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        const retryRes = await axios(original);
        return retryRes.data;
      } catch (refreshErr) {
        // Refresh failed → force logout
        localStorage.removeItem('mediflow.accessToken');
        localStorage.removeItem('mediflow.auth');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    const payload = error.response?.data;
    return Promise.reject({
      status: error.response?.status,
      message: payload?.message || error.message || 'Network error',
      details: payload?.details,
      raw: error,
    });
  }
);

export default api;
