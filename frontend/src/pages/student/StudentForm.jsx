import { useState, useEffect } from 'react';
import { studentApi } from '../../api/student.api.js';
import { Button } from '../../components/common/Button.jsx';
import './Student.css';

export const StudentForm = ({ student, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    batch: '',
    phone: '',
    feeStatus: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!student;

  useEffect(() => {
    if (isEdit) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '', // don't populate password on edit
        rollNumber: student.rollNumber || '',
        batch: student.batch || '',
        phone: student.phone || '',
        feeStatus: student.feeStatus || 'pending'
      });
    }
  }, [student, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSubmit = { ...formData };
      if (isEdit && !dataToSubmit.password) {
        delete dataToSubmit.password; // don't send empty password
      }

      if (isEdit) {
        await studentApi.update(student._id, dataToSubmit);
      } else {
        await studentApi.create(dataToSubmit);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEdit} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Roll Number</label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Batch</label>
          <input type="text" name="batch" value={formData.batch} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Fee Status</label>
          <select name="feeStatus" value={formData.feeStatus} onChange={handleChange}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Password {isEdit && '(Leave blank to keep current)'}</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required={!isEdit} 
          minLength={6} 
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
