import { useState, useEffect } from 'react';
import { courseApi } from '../../api/course.api.js';
import { attendanceApi } from '../../api/attendance.api.js';
import { Button } from '../../components/common/Button.jsx';

export const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAll({});
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch course to get enrolled students
        const courseRes = await courseApi.getById(selectedCourse);
        setStudents(courseRes.data.students || []);

        // Fetch existing attendance for this date
        const attRes = await attendanceApi.getForCourse(selectedCourse, selectedDate);
        
        const initialRecords = {};
        
        if (attRes.data && attRes.data.length > 0) {
          // Pre-fill existing records
          attRes.data[0].records.forEach(r => {
            initialRecords[r.student._id || r.student] = r.status;
          });
        } else {
          // Default to present for new attendance
          courseRes.data.students.forEach(s => {
            initialRecords[s._id] = 'present';
          });
        }
        
        setAttendanceRecords(initialRecords);
      } catch (err) {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [selectedCourse, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student: studentId,
        status,
        remarks: ''
      }));

      await attendanceApi.mark({
        courseId: selectedCourse,
        date: selectedDate,
        records
      });

      alert('Attendance saved successfully!');
    } catch (err) {
      setError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mark Attendance</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Course</label>
            <select 
              className="search-input" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Select a Course --</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
            <input 
              type="date" 
              className="search-input" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedCourse && (
        <div className="card table-container">
          {loading ? (
            <div className="loading">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="empty-state">No students enrolled in this course.</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student.rollNumber || '-'}</td>
                      <td>{student.name}</td>
                      <td>
                        <select 
                          className="search-input" 
                          style={{ maxWidth: '150px' }}
                          value={attendanceRecords[student._id] || 'present'}
                          onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
