import { create } from 'zustand';
import { studentApi } from '../api/student.api.js';

export const useStudentStore = create((set, get) => ({
  students: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
  filters: {
    search: '',
    batch: '',
    feeStatus: '',
    page: 1,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 }
    }));
    get().fetchStudents();
  },

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      // Remove empty filters
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await studentApi.getAll(params);
      set({ 
        students: response.data.students,
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch students', 
        loading: false 
      });
    }
  },

  deleteStudent: async (id) => {
    try {
      await studentApi.delete(id);
      get().fetchStudents(); // Refresh list
    } catch (error) {
      throw error;
    }
  }
}));
