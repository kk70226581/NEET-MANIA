import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { setError, setToken, setUser } from '../store/slices/userSlice';
import { authAPI } from '../services/api';
import './Auth.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      if (response.user?.role !== 'admin') {
        toast.error('This account is not an admin account.');
        return;
      }
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      toast.success('Admin login successful.');
      navigate('/admin/questions');
    } catch (error) {
      const message = error.message || 'Admin login failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth-page">
      <header className="auth-header">
        <div className="auth-logo">
          Solnut Admin
          <svg viewBox="0 0 70 10">
            <path
              d="M2 6 Q 18 1, 36 6 T 68 5"
              stroke="var(--yellow)"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <Link to="/" className="auth-back-link">← Back to home</Link>
      </header>

      <main className="auth-main">
        <div className="auth-card admin-auth-card">
          <div className="auth-card-perf">
            <span className="auth-card-ticket">ADMIN ACCESS ONLY</span>
          </div>
          <div className="auth-card-body">
            <div className="admin-auth-badge">
              <ShieldCheck size={18} />
              Secure question management
            </div>
            <h1>
              Admin login.
              <svg className="auth-card-underline" viewBox="0 0 128 10">
                <path
                  d="M2 6 Q 32 1, 64 6 T 126 5"
                  stroke="var(--yellow)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p className="auth-lede">
              Use this page only for adding, reviewing, and publishing questions.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="admin-email">Admin email</label>
                <input
                  type="text"
                  id="admin-email"
                  name="email"
                  placeholder="admin@solnut.local"
                  className="auth-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="admin-password">Admin password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    name="password"
                    placeholder="••••••••"
                    className="auth-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label="Show password"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Checking admin access...' : 'Enter admin panel'}
              </button>
            </form>

            <p className="auth-switch-line">
              Student? <Link to="/login">Open student login</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="auth-footer">© 2026 Solnut Admin</footer>
    </div>
  );
};

export default AdminLoginPage;
