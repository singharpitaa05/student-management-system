import { useAuth } from '../../hooks/useAuth.js';
import { NotificationDropdown } from './NotificationDropdown.jsx';
import './Layout.css';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-search">
        {/* Can add global search here later */}
      </div>
      <div className="navbar-user">
        <NotificationDropdown />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {user?.role}
          </div>
        </div>
        <div className="avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
      </div>
    </header>
  );
};
