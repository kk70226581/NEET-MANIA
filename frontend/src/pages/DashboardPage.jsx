import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Timer,
  Target,
  TrendingUp,
  BrainCircuit,
  Trophy,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import AppShell from '../components/AppShell';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Reusable Premium Components
const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, gradientClass }) => (
  <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group cursor-default">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${gradientClass}`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 backdrop-blur-md`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-extrabold text-slate-800 mb-1">{value}</div>
      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
      <div className="text-xs font-semibold text-slate-400">{subtitle}</div>
    </div>
  </motion.div>
);

const HeatmapSquare = ({ level }) => {
  const colors = ['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'];
  return <div className={`w-3 h-3 rounded-[3px] ${colors[level]} transition-colors hover:ring-2 ring-emerald-300 ring-offset-1`} />;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = user?.firstName || 'Karan';

  const daysToExam = Math.max(0, Math.ceil((new Date('2027-05-02') - new Date()) / 86400000));

  // Mock data for heatmap
  const heatmapData = Array.from({ length: 84 }, () => Math.floor(Math.random() * 5));

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
                <Sparkles size={16} /> Daily Motivation: "Success is the sum of small efforts, repeated day in and day out."
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                {greeting}, <br/><span className="text-emerald-100">{name} 👋</span>
              </h1>
              <p className="text-emerald-50 text-lg md:text-xl font-medium mb-8 max-w-lg leading-relaxed">
                You're in the top 5% of daily active learners. Let's make today count towards your dream medical college.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/tests')} className="group flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <Play size={20} className="fill-primary" />
                  Generate AI Test
                </button>
                <button onClick={() => navigate('/mistakes')} className="group flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all">
                  <RotateCcw size={20} />
                  Resume Practice
                </button>
              </div>
            </div>

            {/* Countdown Ring */}
            <div className="shrink-0 relative w-48 h-48 md:w-56 md:h-56 flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
              <Timer size={32} className="text-white mb-2 opacity-80" />
              <div className="text-6xl font-black text-white tracking-tighter">{daysToExam}</div>
              <div className="text-sm font-bold text-emerald-100 uppercase tracking-widest mt-1">Days to NEET</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Questions Solved" value="2,451" subtitle="+124 this week" icon={Target} colorClass="bg-blue-500" gradientClass="bg-gradient-to-br from-blue-400 to-indigo-500" />
          <MetricCard title="Avg. Accuracy" value="84%" subtitle="Top 12% globally" icon={TrendingUp} colorClass="bg-emerald-500" gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500" />
          <MetricCard title="Study Streak" value="12 Days" subtitle="Personal best: 24" icon={Flame} colorClass="bg-orange-500" gradientClass="bg-gradient-to-br from-orange-400 to-red-500" />
          <MetricCard title="Current Rank" value="#402" subtitle="Out of 12,450" icon={Trophy} colorClass="bg-purple-500" gradientClass="bg-gradient-to-br from-purple-400 to-pink-500" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Consistency Heatmap */}
          <motion.div variants={itemVariants} className="glass-card p-8 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Consistency Heatmap</h3>
                <p className="text-sm font-semibold text-slate-500">Your daily problem-solving activity</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                Less <HeatmapSquare level={0}/> <HeatmapSquare level={2}/> <HeatmapSquare level={4}/> More
              </div>
            </div>
            
            <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-4 no-scrollbar">
              {heatmapData.map((level, i) => (
                <HeatmapSquare key={i} level={level} />
              ))}
            </div>
          </motion.div>

          {/* Today's Goal Ring */}
          <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Today's Goal</h3>
            <p className="text-sm font-semibold text-slate-500 mb-8">100 questions practice</p>
            
            <div className="relative w-48 h-48 mb-6">
              {/* Fake SVG Circle Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800">75%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</span>
              </div>
            </div>
            <button className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <Clock size={16} /> 25 questions left
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Smart Insights */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">AI Mentor Insights</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Weakness Detected: Genetics</h4>
                  <p className="text-sm font-medium text-slate-500">Your accuracy in Molecular Basis of Inheritance dropped to 42% yesterday. Recommend generating a focused 20-question Topic Test.</p>
                </div>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Strength: Human Physiology</h4>
                  <p className="text-sm font-medium text-slate-500">You are consistently scoring 90%+ in Digestion and Absorption. Keep up the great work!</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Schedule */}
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">Study Schedule</h3>
              </div>
              <button className="text-sm font-bold text-primary hover:text-emerald-700">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Full Length NEET Mock', time: 'Today, 2:00 PM', type: 'Test', color: 'bg-orange-100 text-orange-600' },
                { title: 'Revise Mistake Notebook', time: 'Tomorrow, 9:00 AM', type: 'Revision', color: 'bg-purple-100 text-purple-600' },
                { title: 'Physics PYQ Sprint', time: 'Friday, 4:00 PM', type: 'Practice', color: 'bg-blue-100 text-blue-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-md text-xs font-bold ${item.color}`}>
                      {item.type}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-sm font-semibold text-slate-400">{item.time}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </AppShell>
  );
};

export default DashboardPage;
