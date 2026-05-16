import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      if (response.data.emailVerified) {
        setMessage('Email verified! Please enter your new password.');
        setStep('reset');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword
      });
      setMessage(response.data.message);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-title">E-Waste Management System</div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div>
              <span className="badge login-badge">
                {step === 'email' ? 'VERIFY EMAIL' : 'RESET PASSWORD'}
              </span>
            </div>
            <h2>{step === 'email' ? 'Forgot your password?' : 'Set new password'}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {step === 'email'
                ? 'Enter your registered email to verify your account.'
                : 'Enter and confirm your new password below.'}
            </p>
          </div>

          <div className="login-content">
            {error && <div className="login-error">{error}</div>}
            {message && <div className="login-success">{message}</div>}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} noValidate>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? (
                    <>
                      Verifying<div className="loading-ring" />
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} noValidate>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>

                <div className="input-group password-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? (
                    <>
                      Resetting<div className="loading-ring" />
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            <div className="login-links">
              <Link to="/login">Back to Login</Link>
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="login-footer">
        <div>© 2026 E-Waste Management System</div>
        <div>Contact: <a href="mailto:support@ewaste.com">support@ewaste.com</a> | +91 7207914740</div>
        <div className="footer-links">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms &amp; Conditions</Link>
          <Link to="#">Help</Link>
        </div>
        <div className="footer-tagline">Building a cleaner environment through responsible e-waste disposal.</div>
      </footer>
    </div>
  );
};

export default ForgotPassword;