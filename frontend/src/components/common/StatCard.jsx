import '../../pages/dashboard/Dashboard.css';

export const StatCard = ({ title, value, icon, color = 'var(--primary)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};
