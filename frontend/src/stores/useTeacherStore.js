import { create } from 'zustand';
import { teacherApi } from '../api/teacher.api.js';

export const useTeacherStore = create((set, get) => ({
  teachers: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
  filters: {
    search: '',
    department: '',
    page: 1,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 }
    }));
    get().fetchTeachers();
  },

  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      // Remove empty filters
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await teacherApi.getAll(params);
      set({ 
        teachers: response.data.data || [],
        pagination: { page: 1, limit: 10, total: response.data.data?.length || 0, totalPages: 1 },
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch teachers', 
        loading: false 
      });
    }
  },

  deleteTeacher: async (id) => {
    try {
      await teacherApi.delete(id);
      get().fetchTeachers(); // Refresh list
    } catch (error) {
      throw error;
    }
  }
}));
