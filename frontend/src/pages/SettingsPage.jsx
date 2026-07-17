import React, { useEffect, useState } from 'react';
import { Bell, Lock, Save, Settings, ShieldCheck, User, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppShell from '../components/AppShell';
import { authAPI } from '../services/api';
import { setUser } from '../store/slices/userSlice';

const SettingsPage = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', targetYear: '2027' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', targetYear: user.targetYear || '2027' });
  }, [user]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({ ...form, targetYear: Number(form.targetYear) });
      const updated = response.data || { ...user, ...form };
      dispatch(setUser(updated));
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-float bg-blue-600"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-500 to-indigo-800 opacity-90" />
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
          
          {/* Decorative Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-400/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold mb-6">
                <Settings size={16} /> Preferences
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Account Settings
              </h1>
              <p className="text-emerald-50 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
                Keep your study workspace personal and secure. Update your student profile and review the account details used across Solnut.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN SETTINGS FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 md:p-10 lg:col-span-2 rounded-[2rem]"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Personal information</h2>
                <p className="text-slate-500 font-medium">Shown in your dashboard and reports.</p>
              </div>
            </div>

            <form onSubmit={save} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">First name</label>
                  <input 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={update} 
                    required 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white font-medium text-slate-700 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Last name</label>
                  <input 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={update} 
                    required 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white font-medium text-slate-700 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email address</label>
                <input 
                  value={user?.email || ''} 
                  disabled 
                  className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed opacity-80"
                />
                <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1"><AlertCircle size={12}/> Email cannot be changed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={update} 
                    placeholder="10-digit mobile number" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white font-medium text-slate-700 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Target year</label>
                  <select 
                    name="targetYear" 
                    value={form.targetYear} 
                    onChange={update}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white font-medium text-slate-700 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Target exam</label>
                <input 
                  value="NEET UG" 
                  disabled 
                  className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed opacity-80"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 mt-8 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Saving changes...' : 'Save changes'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* SIDEBAR WIDGETS */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-[2rem] border-t-4 border-t-emerald-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-widest">
                  Active
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">Account status</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Your JWT-protected student account is secure and fully active. All premium features are unlocked.
              </p>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full glass-card p-6 flex items-center gap-5 hover:border-primary/30 hover:shadow-md transition-all group text-left rounded-[2rem]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">Password & security</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Change your password regularly</p>
              </div>
            </motion.button>

            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full glass-card p-6 flex items-center gap-5 hover:border-primary/30 hover:shadow-md transition-all group text-left rounded-[2rem]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Bell size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">Study reminders</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Daily plan and revision alerts</p>
              </div>
            </motion.button>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
