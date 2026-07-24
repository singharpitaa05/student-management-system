import { useEffect } from 'react';
import { BookOpen, Calendar, CreditCard } from 'lucide-react';
import { useDashboardStore } from '../../stores/useDashboardStore.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import './Dashboard.css';

export const StudentDashboard = () => {
  const { data, loading, error, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard('student');
  }, [fetchDashboard]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  const { stats } = data;

  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'var(--secondary)';
      case 'pending': return '#F59E0B';
      case 'overdue': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Dashboard</h1>
      </div>

      <div className="dashboard-stats-grid">
        <StatCard 
          title="Enrolled Courses" 
          value={stats.enrolledCourses} 
          icon={<BookOpen size={24} color="white" />} 
          color="var(--primary)" 
        />
        <StatCard 
          title="Average Attendance" 
          value={`${stats.averageAttendance}%`} 
          icon={<Calendar size={24} color="white" />} 
          color="#8B5CF6" 
        />
        <StatCard 
          title="Fee Status" 
          value={stats.feeStatus.toUpperCase()} 
          icon={<CreditCard size={24} color="white" />} 
          color={getFeeStatusColor(stats.feeStatus)} 
        />
      </div>

      {/* Placeholders for upcoming modules */}
      <div className="dashboard-section mt-xl">
        <h2 className="section-title">Recent Activity</h2>
        <div className="card">
          <p>More features coming soon (Courses, Attendance tracking).</p>
        </div>
      </div>
    </div>
  );
};
