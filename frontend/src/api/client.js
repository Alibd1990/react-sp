import axios from 'axios';
import { isJwtValid } from '../auth/jwt';
import { clearTokens, getAccessToken } from '../auth/tokenStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isJwtValid(token)) {
    clearTokens();
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
    return Promise.reject(new Error('Token expired'));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
