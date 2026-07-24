import { axiosInstance } from './axiosInstance.js';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (data) => {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }
};
