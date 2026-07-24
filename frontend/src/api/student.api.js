import { axiosInstance } from './axiosInstance.js';

export const studentApi = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/students', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/students', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.patch(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },
  
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/upload/avatar', formData);
    return response.data;
  }
};
