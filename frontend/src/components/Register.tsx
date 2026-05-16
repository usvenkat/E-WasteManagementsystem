import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface RegisterProps {
  isAdmin?: boolean;
}

const Register: React.FC<RegisterProps> = ({ isAdmin = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isAdmin 
        ? await authService.adminRegister({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        : await authService.register(formData);

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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-title">E-Waste Management System</div>

      <div className="register-card-wrapper">
        <div className="register-card">
          <div className="register-header">
            <div>
              <span className="badge login-badge">
                {isAdmin ? 'ADMIN REGISTRATION' : 'USER REGISTRATION'}
              </span>
            </div>
            <h3>{isAdmin ? 'Create Admin Account' : 'Create Your Account'}</h3>
          </div>

          <div className="login-content">
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  type="text"
                  id="reg-name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <div className="form-text">Password must be at least 6 characters long.</div>
              </div>

              {!isAdmin && (
                <>
                  <div className="input-group">
                    <label htmlFor="reg-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="reg-address">Address</label>
                    <textarea
                      id="reg-address"
                      name="address"
                      placeholder="Enter your pickup address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        border: '1px solid rgba(255,255,255,0.16)',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#f8fafc',
                        borderRadius: '18px',
                        padding: '1rem 1.1rem',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="login-links">
              {isAdmin ? (
                <Link to="/admin/login">Already have an admin account? Login</Link>
              ) : (
                <Link to="/login">Already have an account? Login</Link>
              )}
              {!isAdmin && <Link to="/admin/register">Admin Registration</Link>}
              {isAdmin && <Link to="/register">User Registration</Link>}
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

export default Register;
