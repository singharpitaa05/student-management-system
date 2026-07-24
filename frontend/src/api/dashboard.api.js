import { axiosInstance } from './axiosInstance.js';

export const dashboardApi = {
  getAdminStats: async () => {
    const response = await axiosInstance.get('/dashboard/admin');
    return response.data;
  },
  
  getTeacherStats: async () => {
    const response = await axiosInstance.get('/dashboard/teacher');
    return response.data;
  },

  getStudentStats: async () => {
    const response = await axiosInstance.get('/dashboard/student');
    return response.data;
  }
};
