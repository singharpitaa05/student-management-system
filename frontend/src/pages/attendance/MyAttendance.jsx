import { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendance.api.js';
import { useAuth } from '../../hooks/useAuth.js';

export const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attendanceApi.getForStudent(user._id || user.id);
        setAttendance(res.data);
      } catch (err) {
        setError('Failed to load your attendance');
      } finally {
        setLoading(false);
      }
    };
    const studentId = user?._id || user?.id;
    if (studentId) {
      fetchAttendance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'status-paid'; // Green
      case 'absent': return 'status-overdue'; // Red
      case 'late': return 'status-pending'; // Yellow
      case 'excused': return 'status-active'; // Blue-ish
      default: return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Attendance Records</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card table-container">
        {loading ? (
          <div className="loading">Loading records...</div>
        ) : attendance.length === 0 ? (
          <div className="empty-state">No attendance records found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.course?.code} - {record.course?.name}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
