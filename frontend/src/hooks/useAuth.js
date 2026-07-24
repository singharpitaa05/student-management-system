import { useAuthStore } from '../stores/useAuthStore.js';
import { ROLES } from '../utils/roles.js';

export const useAuth = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    logout,
    isAdmin: user?.role === ROLES.ADMIN,
    isTeacher: user?.role === ROLES.TEACHER,
    isStudent: user?.role === ROLES.STUDENT,
  };
};
