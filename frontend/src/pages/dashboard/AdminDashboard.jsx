import { useEffect } from 'react';
import { Users, UserCheck, AlertCircle, CreditCard, Clock } from 'lucide-react';
import { useDashboardStore } from '../../stores/useDashboardStore.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import './Dashboard.css';

export const AdminDashboard = () => {
  const { data, loading, error, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard('admin');
  }, [fetchDashboard]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  const { stats, recentStudents } = data;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats-grid">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={<Users size={24} color="white" />} 
          color="var(--primary)" 
        />
        <StatCard 
          title="Total Teachers" 
          value={stats.totalTeachers} 
          icon={<UserCheck size={24} color="white" />} 
          color="#8B5CF6" 
        />
        <StatCard 
          title="Paid Fees" 
          value={stats.paidFees} 
          icon={<CreditCard size={24} color="white" />} 
          color="var(--secondary)" 
        />
        <StatCard 
          title="Pending Fees" 
          value={stats.pendingFees} 
          icon={<Clock size={24} color="white" />} 
          color="#F59E0B" 
        />
        <StatCard 
          title="Overdue Fees" 
          value={stats.overdueFees} 
          icon={<AlertCircle size={24} color="white" />} 
          color="var(--danger)" 
        />
      </div>

      <div className="dashboard-section mt-xl">
        <h2 className="section-title">Recent Registrations</h2>
        <div className="card">
          {recentStudents.length > 0 ? (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.rollNumber || '-'}</td>
                    <td>{student.email}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent registrations.</p>
          )}
        </div>
      </div>
    </div>
  );
};
