import { axiosInstance } from './axiosInstance.js';

export const courseApi = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/courses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/courses', data);
    return response.data;
  },

  enroll: async (courseId, studentId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/enroll`, { studentId });
    return response.data;
  },

  removeStudent: async (courseId, studentId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/remove`, { studentId });
    return response.data;
  }
};
