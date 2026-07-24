import { BarChart3, BookOpen, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api.js';
import { StatCard } from '../../components/common/StatCard.jsx';

export const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getTeacherStats();
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="page-container"><div className="loading">Loading dashboard...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Assigned Courses" 
          value={data.stats.assignedCourses} 
          icon={<BookOpen size={24} color="var(--primary)" />} 
        />
        <StatCard 
          title="Total Students" 
          value={data.stats.totalStudentsInCourses} 
          icon={<Users size={24} color="var(--secondary)" />} 
        />
        <StatCard 
          title="Avg Attendance" 
          value={`${data.stats.averageAttendance}%`} 
          icon={<BarChart3 size={24} color="var(--warning)" />} 
          trend={data.stats.averageAttendance > 75 ? "+Good" : "-Needs Attention"}
        />
        <StatCard 
          title="Active Performance" 
          value="Optimal" 
          icon={<TrendingUp size={24} color="var(--success)" />} 
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Recent Courses</h2>
            <Link to="/teacher/courses" className="card-action">View All</Link>
          </div>
          {data.assignedCourses && data.assignedCourses.length > 0 ? (
            <div className="recent-list">
              {data.assignedCourses.map(course => (
                <div key={course._id} className="recent-item">
                  <div className="recent-info">
                    <p className="recent-name">{course.name} ({course.code})</p>
                    <p className="recent-sub">Students: {course.students?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No courses assigned yet.</div>
          )}
        </div>
        
        {/* Placeholder for Quick Actions or Schedule */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/teacher/attendance" className="btn btn-secondary" style={{ textAlign: 'center' }}>Mark Attendance</Link>
            <Link to="/teacher/students" className="btn btn-secondary" style={{ textAlign: 'center' }}>View Students</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
