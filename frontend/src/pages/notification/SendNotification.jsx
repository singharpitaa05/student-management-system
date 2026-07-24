import { useState } from 'react';
import { notificationApi } from '../../api/notification.api.js';
import { Button } from '../../components/common/Button.jsx';

export const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    role: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await notificationApi.send(formData);
      setSuccess(`Successfully sent ${res.data.count} notifications.`);
      setFormData({ ...formData, title: '', message: '' }); // reset fields
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Broadcast Notification</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-message" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: 'var(--radius-md)' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Audience</label>
            <select name="role" value={formData.role} onChange={handleChange} className="search-input" style={{ width: '100%' }}>
              <option value="all">All Users</option>
              <option value="student">All Students</option>
              <option value="teacher">All Teachers</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notification Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="search-input" style={{ width: '100%' }}>
              <option value="general">General Update</option>
              <option value="system">System Maintenance</option>
              <option value="payment">Fee Reminder</option>
              <option value="holiday">Holiday</option>
              <option value="offer">Offer</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              className="search-input"
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
