import { useState, useEffect } from 'react';
import { courseApi } from '../../api/course.api.js';
import { teacherApi } from '../../api/teacher.api.js';
import { Button } from '../../components/common/Button.jsx';
import { toast } from 'react-toastify';

export const CourseForm = ({ course, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    credits: course?.credits || 3,
    teacher: course?.teacher?._id || course?.teacher || '',
    isActive: course ? course.isActive : true,
  });
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!course;

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const res = await teacherApi.getAll({});
        setTeachers(res.data?.data || res.data?.teachers || []);
      } catch (err) {
        toast.error('Failed to load teachers for selection');
      }
    };
    loadTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await courseApi.update(course._id, formData);
        toast.success('Course updated successfully');
      } else {
        await courseApi.create(formData);
        toast.success('Course created successfully');
      }
      onSuccess();
    } catch (error) {
      // Handled by global interceptor, but we catch to stop loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <div className="form-group">
        <label>Course Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Introduction to Programming"
        />
      </div>

      <div className="form-group">
        <label>Course Code</label>
        <input 
          type="text" 
          name="code" 
          value={formData.code} 
          onChange={handleChange} 
          required 
          placeholder="CS101"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="form-group">
        <label>Credits</label>
        <input 
          type="number" 
          name="credits" 
          value={formData.credits} 
          onChange={handleChange} 
          required 
          min="1"
          max="10"
        />
      </div>

      <div className="form-group">
        <label>Assign Teacher</label>
        <select 
          name="teacher" 
          value={formData.teacher} 
          onChange={handleChange} 
          required
        >
          <option value="">Select a Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Brief overview of the course..."
          rows="3"
        />
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="isActive"
          name="isActive" 
          checked={formData.isActive} 
          onChange={handleChange} 
        />
        <label htmlFor="isActive" style={{ margin: 0 }}>Course is Active</label>
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}
        </Button>
      </div>
    </form>
  );
};
