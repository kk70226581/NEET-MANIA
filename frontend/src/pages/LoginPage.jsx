import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken, setError } from '../store/slices/userSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      if (response.user?.role === 'admin') {
        toast.error('Please use the admin login page.');
        navigate('/admin/login');
        return;
      }
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.message || 'Login failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <svg className="grain" width="100%" height="100%">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="chalkRough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="auth-header">
        <div className="auth-logo">
          Solnut
          <svg viewBox="0 0 70 10">
            <path
              d="M2 6 Q 18 1, 36 6 T 68 5"
              stroke="var(--yellow)"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              filter="url(#chalkRough)"
            />
          </svg>
        </div>
        <Link to="/" className="auth-back-link">
          ← Back to home
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-perf">
            <span className="auth-card-ticket">FORM NO. SLN-2027-04821</span>
          </div>
          <div className="auth-card-body">
            <h1>
              Student login.
              <svg className="auth-card-underline" viewBox="0 0 128 10">
                <path
                  d="M2 6 Q 32 1, 64 6 T 126 5"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#chalkRough)"
                />
              </svg>
            </h1>
            <p className="auth-lede">For students practising tests, reviewing mistakes, and using the question bank.</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">Email or phone</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  className="auth-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
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
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Show password"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="auth-row-between">
                <span></span>
                <span>Use your registered email or phone number.</span>
              </div>

              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Log in'}
              </button>

              <div className="auth-form-msg" id="formMsg"></div>
            </form>

            <p className="auth-switch-line">
              New to Solnut? <Link to="/register">Create a free account →</Link>
            </p>
            <p className="auth-switch-line">
              Admin? <Link to="/admin/login">Open admin login</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="auth-footer">© 2026 Solnut</footer>
    </div>
  );
};

export default LoginPage;
