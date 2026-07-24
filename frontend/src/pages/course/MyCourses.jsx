import { useState, useEffect } from 'react';
import { courseApi } from '../../api/course.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/common/Button.jsx';
import { toast } from 'react-toastify';
import './Course.css';

export const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchMyCourses = async () => {
    try {
      const [enrolledRes, allRes] = await Promise.all([
        courseApi.getAll({ enrolled: 'true' }),
        courseApi.getAll({})
      ]);
      
      const enrolled = enrolledRes.data || [];
      const all = allRes.data || [];
      
      setEnrolledCourses(enrolled);
      
      // Filter out courses the student is already enrolled in
      const enrolledIds = new Set(enrolled.map(c => c._id));
      setAvailableCourses(all.filter(c => !enrolledIds.has(c._id)));
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      await courseApi.enroll(courseId, user._id || user.id);
      toast.success('Successfully enrolled in course!');
      fetchMyCourses(); // Refresh the lists after successful enrollment
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="course-page">
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Enrolled Courses</h2>
        <div className="course-grid">
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>You are not enrolled in any courses yet.</div>
          ) : (
            enrolledCourses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-card-header">
                  <h3 className="course-code">{course.code}</h3>
                  <span className="status-badge status-active">Enrolled</span>
                </div>
                <h2 className="course-name">{course.name}</h2>
                <p className="course-description">{course.description || 'No description provided.'}</p>
                
                <div className="course-details">
                  <div className="course-detail-item">
                    <span className="label">Credits</span>
                    <span className="value">{course.credits}</span>
                  </div>
                  <div className="course-detail-item">
                    <span className="label">Teacher</span>
                    <span className="value">{course.teacher?.name}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>Available Courses</h2>
        <div className="course-grid">
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : availableCourses.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No more courses available for enrollment.</div>
          ) : (
            availableCourses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-card-header">
                  <h3 className="course-code">{course.code}</h3>
                </div>
                <h2 className="course-name">{course.name}</h2>
                <p className="course-description">{course.description || 'No description provided.'}</p>
                
                <div className="course-details">
                  <div className="course-detail-item">
                    <span className="label">Credits</span>
                    <span className="value">{course.credits}</span>
                  </div>
                  <div className="course-detail-item">
                    <span className="label">Teacher</span>
                    <span className="value">{course.teacher?.name}</span>
                  </div>
                </div>
                
                <div className="course-actions">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrolling === course._id || !course.isActive}
                  >
                    {enrolling === course._id ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
