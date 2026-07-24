import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore.js';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For refresh token cookie
});

// Request Interceptor to add Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and we haven't retried yet, and it's not a login/signup request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') && 
      !originalRequest.url.includes('/auth/signup')
    ) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data.data;
        
        // Update store with new token
        useAuthStore.getState().setAccessToken(accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);
