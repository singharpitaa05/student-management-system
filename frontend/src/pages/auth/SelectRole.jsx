import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { toast } from 'react-toastify';
import './Auth.css';

export const SelectRole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const tempToken = location.state?.tempToken;

  useEffect(() => {
    if (!tempToken) {
      toast.error('Authentication session expired. Please sign in again.');
      navigate('/login', { replace: true });
    }
  }, [tempToken, navigate]);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const response = await authApi.completeGoogleSignup(tempToken, role);
      
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      toast.success(`Welcome ${user.name}! Registered successfully.`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration.');
      setLoading(false);
    }
  };

  if (!tempToken) return null;

  return (
    <div className="auth-container">
      <div className="auth-card select-role-card">
        <h1 className="auth-title">Choose Your Role</h1>
        <p className="auth-subtitle">Select how you want to join the platform to complete your profile registration</p>

        <div className="role-cards-container">
          <button 
            className={`role-card ${loading && selectedRole === 'student' ? 'role-card-loading' : ''}`}
            onClick={() => handleRoleSelect('student')}
            disabled={loading}
          >
            <div className="role-icon-wrapper student-icon">
              <GraduationCap size={40} />
            </div>
            <div className="role-info">
              <h3>Join as Student</h3>
              <p>Access your courses, track attendance, and view academic reports.</p>
            </div>
          </button>

          <button 
            className={`role-card ${loading && selectedRole === 'teacher' ? 'role-card-loading' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
            disabled={loading}
          >
            <div className="role-icon-wrapper teacher-icon">
              <Briefcase size={36} />
            </div>
            <div className="role-info">
              <h3>Join as Teacher</h3>
              <p>Manage your students, grade assignments, and mark attendance reports.</p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="role-loading-text">
            Setting up your {selectedRole} account...
          </div>
        )}
      </div>
    </div>
  );
};
