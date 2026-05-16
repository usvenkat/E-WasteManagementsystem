import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface LoginProps {
  isAdmin?: boolean;
}

const Login: React.FC<LoginProps> = ({ isAdmin = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!emailPattern.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const response = isAdmin
        ? await authService.adminLogin(formData)
        : await authService.login(formData);

      if (response.token && (response.user || response.admin)) {
        const user = response.user || response.admin;
        const role = isAdmin ? 'admin' : 'user';
        authService.storeAuthData(response.token, user!, role);

        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
              <span className="badge login-badge">USER LOGIN</span>
            </div>
            <h2>Secure access for responsible disposal</h2>
          </div>

          <div className="login-content">
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              <div className="input-group password-field">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

              <div className="forgot-row">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    Signing in<div className="loading-ring" />
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="login-links">
              <Link to="/register">Don't have an account? Register</Link>
              {!isAdmin ? (
                <Link to="/admin/login">Admin Login</Link>
              ) : (
                <Link to="/login">User Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="login-footer">
        <div>© 2026 E-Waste Management System</div>
        <div>Contact: <a href="mailto:support@ewaste.com">support@ewaste.com</a> | +91 7207914740</div>
        <div className="footer-links">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms & Conditions</Link>
          <Link to="#">Help</Link>
        </div>
        <div className="footer-tagline">Building a cleaner environment through responsible e-waste disposal.</div>
      </footer>
    </div>
  );
};

export default Login;
