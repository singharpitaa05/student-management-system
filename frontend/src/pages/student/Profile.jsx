import { useState, useRef } from 'react';
import { Camera, Mail, Phone, Book } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { studentApi } from '../../api/student.api.js';
import './Student.css';

export const Profile = () => {
  const { user } = useAuth();
  const setAuth = useAuthStore(state => state.setAuth);
  const accessToken = useAuthStore(state => state.accessToken);
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const res = await studentApi.uploadAvatar(file);
      // Update local store user
      const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
      setAuth(updatedUser, accessToken);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-wrapper" onClick={handleAvatarClick}>
              {uploading ? (
                <div className="avatar-loading">Uploading...</div>
              ) : user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">{user.name.charAt(0)}</div>
              )}
              <div className="avatar-overlay">
                <Camera size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-role">{user.role}</p>
          </div>

          {error && <div className="error-message" style={{ margin: '1rem' }}>{error}</div>}

          <div className="profile-details">
            <div className="detail-item">
              <Mail size={18} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>
            
            {user.role === 'student' && (
              <div className="detail-item">
                <Book size={18} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Roll Number</span>
                  <span className="detail-value">{user.rollNumber || 'Not assigned'}</span>
                </div>
              </div>
            )}
            
            <div className="detail-item">
              <Phone size={18} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
