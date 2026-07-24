import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => 
        set({ user, accessToken, isAuthenticated: !!user }),
      
      setAccessToken: (accessToken) => 
        set({ accessToken }),
        
      logout: () => 
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Don't persist token in localStorage if using HttpOnly cookies for refresh, but we need the user profile
    }
  )
);
