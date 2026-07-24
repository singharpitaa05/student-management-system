import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Calendar, Settings, LogOut, Bell, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import './Layout.css';

export const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin, isTeacher, isStudent, logout } = useAuth();

  const handleLogout = () => {
    logout(); // Clear store
    window.location.href = '/login'; // Force reload to clear states
  };

  const getLinks = () => {
    const rolePrefix = `/${user?.role}`;
    const links = [
      { path: `${rolePrefix}/dashboard`, icon: <Home size={20} />, label: 'Dashboard' },
    ];

    if (isAdmin || isTeacher) {
      links.push({ path: `${rolePrefix}/students`, icon: <Users size={20} />, label: 'Students' });
      links.push({ path: `${rolePrefix}/courses`, icon: <BookOpen size={20} />, label: 'Courses' });
      links.push({ path: `${rolePrefix}/attendance`, icon: <Calendar size={20} />, label: 'Attendance' });
    }

    if (isStudent) {
      links.push({ path: '/student/courses', icon: <BookOpen size={20} />, label: 'My Courses' });
      links.push({ path: '/student/attendance', icon: <Calendar size={20} />, label: 'My Attendance' });
      links.push({ path: '/student/payments', icon: <CreditCard size={20} />, label: 'Payments' });
    }

    if (isAdmin) {
      links.push({ path: '/admin/teachers', icon: <Users size={20} />, label: 'Teachers' });
      links.push({ path: '/admin/notifications/send', icon: <Bell size={20} />, label: 'Broadcast' });
    }

    // Common links
    links.push({ path: `${rolePrefix}/profile`, icon: <Settings size={20} />, label: 'Profile' });
    
    return links;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        SMS Portal
      </div>
      <nav className="sidebar-nav">
        {getLinks().map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`nav-item ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '1rem' }}>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: 'none', background: 'transparent', color: 'var(--danger)', fontWeight: '500', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
};
