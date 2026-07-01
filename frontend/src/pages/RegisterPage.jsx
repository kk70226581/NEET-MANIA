import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store/slices/userSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    class: '12'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'confirmPassword' && value && formData.password !== value) {
      setPasswordError("Passwords don't match yet.");
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await authAPI.register(submitData);

      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
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
            <span className="auth-card-ticket">FORM NO. SLN-2027-04822</span>
          </div>
          <div className="auth-card-body">
            <h1>
              Start your prep.
              <svg className="auth-card-underline" viewBox="0 0 108 10">
                <path
                  d="M2 6 Q 27 1, 54 6 T 106 5"
                  stroke="var(--pink)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#chalkRough)"
                />
              </svg>
            </h1>
            <p className="auth-lede">Free question bank, NCERT-mapped from day one.</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="firstName">Full name</label>
                <div className="auth-two-col">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    className="auth-input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    className="auth-input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
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
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="98765 43210"
                  className="auth-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="class">Target year / Class</label>
                <select
                  id="class"
                  name="class"
                  className="auth-select"
                  value={formData.class}
                  onChange={handleChange}
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="drop">Drop year</option>
                  <option value="just-exploring">Just exploring</option>
                </select>
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
                    minLength="8"
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
                <p className="auth-hint">At least 8 characters.</p>
              </div>

              <div className="auth-field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirm"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="auth-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength="8"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Show password"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                {passwordError && <p className={`auth-error ${passwordError ? 'show' : ''}`}>{passwordError}</p>}
              </div>

              <label className="auth-terms">
                <input type="checkbox" required />
                <span>
                  I confirm that the details above are correct.
                </span>
              </label>

              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="auth-switch-line">
              Already revising with us? <Link to="/login">Log in →</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="auth-footer">© 2026 Solnut</footer>
    </div>
  );
};

export default RegisterPage;
