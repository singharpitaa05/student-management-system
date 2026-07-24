import { axiosInstance } from './axiosInstance.js';

export const paymentApi = {
  createOrder: async (courseId) => {
    const response = await axiosInstance.post('/payments/create-order', { courseId });
    return response.data;
  },

  verifyPayment: async (paymentDetails) => {
    const response = await axiosInstance.post('/payments/verify', paymentDetails);
    return response.data;
  },

  getMyPayments: async () => {
    const response = await axiosInstance.get('/payments/my-payments');
    return response.data;
  }
};
