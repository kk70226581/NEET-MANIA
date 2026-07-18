import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store/slices/userSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BrainCircuit, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import neetDoctorHero from '../assets/neet-doctor-hero.png';

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
    const next = { ...formData, [name]: value };
    setFormData(next);
    setPasswordError(next.confirmPassword && next.password !== next.confirmPassword ? "Passwords don't match." : '');
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
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
                <BrainCircuit size={24} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">Medical Mania</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400"
                    placeholder="First"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400"
                    placeholder="Last"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Target Class
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm"
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="drop">Dropper</option>
                  <option value="just-exploring">Just Exploring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength="8"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength="8"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white border ${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-600 focus:border-indigo-600'} rounded-xl focus:ring-2 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || passwordError !== ''}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Create Account <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Right Graphic Section (Hidden on Mobile) */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-slate-900">
        <img
          src={neetDoctorHero}
          alt="NEET aspirant preparing for a medical career"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-md backdrop-blur-sm bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              <span className="p-3 bg-white/20 rounded-2xl">
                <BrainCircuit size={40} className="text-indigo-200" />
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4 leading-tight">
              "Every single hour you study brings you one step closer to your white coat."
            </h3>
            <p className="text-indigo-200 font-medium">
              Join thousands of NEET aspirants practising smarter.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
