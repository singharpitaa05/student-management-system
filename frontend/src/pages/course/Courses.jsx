import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { courseApi } from '../../api/course.api.js';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CourseForm } from './CourseForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import './Course.css';

export const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isTeacher, isAdmin } = useAuth();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = isTeacher ? { assigned: 'true' } : {};
      const res = await courseApi.getAll(params);
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [isTeacher]);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    fetchCourses();
  };

  return (
    <div className="course-page">
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        {(isAdmin || isTeacher) && (
          <Button variant="primary" onClick={handleOpenForm}>
            <Plus size={18} /> Add Course
          </Button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="course-grid">
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">No courses found.</div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-card-header">
                <h3 className="course-code">{course.code}</h3>
                <span className={`status-badge status-${course.isActive ? 'active' : 'inactive'}`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
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
                  <span className="value">{course.teacher?.name || 'Unassigned'}</span>
                </div>
              </div>
              
              <div className="course-actions">
                <Button variant="secondary" size="sm">View Details</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        title="Add New Course"
      >
        <CourseForm 
          onSuccess={handleSuccess} 
          onCancel={handleCloseForm} 
        />
      </Modal>
    </div>
  );
};
