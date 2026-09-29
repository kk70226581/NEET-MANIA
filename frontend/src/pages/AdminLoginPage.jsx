import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken, setError } from '../store/slices/userSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BrainCircuit, Loader2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import neetDoctorHero from '../assets/neet-doctor-hero.png';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: '12345678',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fillDefaultCredentials = () => {
    setFormData({
      email: 'admin@gmail.com',
      password: '12345678',
    });
    toast.success('Admin credentials filled: admin@gmail.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(formData);
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      toast.success('Admin login successful!');
      navigate('/admin/overview');
    } catch (error) {
      const message = error.message || 'Admin login failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
                <BrainCircuit size={24} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                Medical Mania
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3">
              <ShieldCheck size={14} /> Owner & Admin Portal
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Access the Medical Mania management center, AI chatbot diagnostics, and question review bank.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Quick credentials hint */}
            <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-indigo-600 shrink-0" />
                <div>
                  <div className="font-bold">Default Credentials:</div>
                  <div className="text-[11px] text-indigo-700">admin@gmail.com / 12345678</div>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-sm border border-indigo-200 hover:bg-indigo-50 transition"
              >
                Auto-fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Admin ID / Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400"
                  placeholder="admin@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-400 pr-12"
                    placeholder="Enter password (e.g. 12345678)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign in as Admin <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                ← Back to Student Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Graphic Section (Hidden on Mobile) */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-slate-950">
        <img
          src={neetDoctorHero}
          alt="NEET Aspirant Platform Administration"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-slate-950/95" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-md backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              <span className="p-3.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
                <ShieldCheck size={40} className="text-emerald-300" />
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3 leading-tight">
              Medical Mania Admin Control
            </h3>
            <p className="text-indigo-200 font-medium text-sm leading-relaxed">
              Curate the question bank, monitor learner test telemetry, and configure live AWS Bedrock and Gemma AI models.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
