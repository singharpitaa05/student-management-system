import { axiosInstance } from './axiosInstance.js';

export const teacherApi = {
  getAll: async (params) => {
    return axiosInstance.get('/teachers', { params });
  },
  
  getById: async (id) => {
    return axiosInstance.get(`/teachers/${id}`);
  },
  
  create: async (data) => {
    return axiosInstance.post('/teachers', data);
  },
  
  update: async (id, data) => {
    return axiosInstance.patch(`/teachers/${id}`, data);
  },
  
  delete: async (id) => {
    return axiosInstance.delete(`/teachers/${id}`);
  }
};
