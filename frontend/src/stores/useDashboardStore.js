import { create } from 'zustand';
import { dashboardApi } from '../api/dashboard.api.js';

export const useDashboardStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async (role) => {
    set({ loading: true, error: null });
    try {
      let response;
      if (role === 'admin') response = await dashboardApi.getAdminStats();
      else if (role === 'teacher') response = await dashboardApi.getTeacherStats();
      else if (role === 'student') response = await dashboardApi.getStudentStats();
      else throw new Error('Invalid role');

      set({ data: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to load dashboard', 
        loading: false 
      });
    }
  },
}));
