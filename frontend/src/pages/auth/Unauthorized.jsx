import { Link } from 'react-router-dom';
import './Auth.css';

export const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-title" style={{ color: 'var(--danger)' }}>403 - Unauthorized</h1>
        <p className="auth-subtitle">You don't have permission to access this page.</p>
        
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
          Go to Home
        </Link>
      </div>
    </div>
  );
};
