import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api.js';
import { toast } from 'react-toastify';
import './Auth.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
              Please check your inbox (and spam folder) and click the link to reset your password.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <p className="auth-footer">
              Remember your password? <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
