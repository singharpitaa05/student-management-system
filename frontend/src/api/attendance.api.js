import { axiosInstance } from './axiosInstance.js';

export const attendanceApi = {
  mark: async (data) => {
    const response = await axiosInstance.post('/attendance', data);
    return response.data;
  },

  getForCourse: async (courseId, date) => {
    const response = await axiosInstance.get('/attendance', { params: { courseId, date } });
    return response.data;
  },

  getForStudent: async (studentId, courseId) => {
    const response = await axiosInstance.get(`/attendance/student/${studentId}`, { params: { courseId } });
    return response.data;
  }
};
