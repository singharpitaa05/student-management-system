import { useState } from 'react';
import { teacherApi } from '../../api/teacher.api.js';
import { Button } from '../../components/common/Button.jsx';
import { toast } from 'react-toastify';

export const TeacherForm = ({ teacher, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    password: '',
    department: teacher?.department || '',
  });
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!teacher;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { password, ...updateData } = formData;
        // only include password if it was typed
        if (password) updateData.password = password;
        
        await teacherApi.update(teacher._id, updateData);
        toast.success('Teacher updated successfully');
      } else {
        await teacherApi.create(formData);
        toast.success('Teacher created successfully');
      }
      onSuccess();
    } catch (error) {
      // Error is handled by global interceptor, but we can stop loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <div className="form-group">
        <label>Full Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Jane Doe"
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          placeholder="jane.doe@example.com"
        />
      </div>

      <div className="form-group">
        <label>Password {isEditing && '(leave blank to keep current)'}</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required={!isEditing} 
          placeholder={isEditing ? '••••••••' : 'Enter a strong password'}
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label>Department</label>
        <input 
          type="text" 
          name="department" 
          value={formData.department} 
          onChange={handleChange} 
          placeholder="e.g. Mathematics"
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Update Teacher' : 'Create Teacher')}
        </Button>
      </div>
    </form>
  );
};
