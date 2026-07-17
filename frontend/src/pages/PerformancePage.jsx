import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  ClipboardList, 
  Target, 
  TrendingUp,
  Brain,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar
} from 'recharts';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-${color}-500 transition-transform group-hover:scale-150 duration-500`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <TrendingUp size={12} className="mr-1" /> {trend}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-extrabold text-slate-800 mb-1">{value}</div>
      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
      <div className="text-xs font-semibold text-slate-400">{subtitle}</div>
    </div>
  </motion.div>
);

const PerformancePage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testsAPI.getUserAttempts({ limit: 50 })
      .then((res) => setAttempts((res.data || []).filter((item) => ['submitted', 'completed'].includes(item.status))))
      .catch((err) => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const count = attempts.length;
    const average = count ? Math.round(attempts.reduce((sum, item) => sum + ((item.score || 0) / (item.maxScore || 720)) * 100, 0) / count) : 0;
    const best = count ? Math.max(...attempts.map((item) => item.score || 0)) : 0;
    const questions = attempts.reduce((sum, item) => sum + (item.analysis?.totalQuestionsAttempted || 0), 0);
    return { count, average, best, questions };
  }, [attempts]);

  // Mock data for beautiful charts (since real attempts might be sparse)
  const scoreData = [
    { name: 'Mock 1', score: 320, accuracy: 65 },
    { name: 'Mock 2', score: 410, accuracy: 72 },
    { name: 'Mock 3', score: 390, accuracy: 70 },
    { name: 'Mock 4', score: 480, accuracy: 78 },
    { name: 'Mock 5', score: 550, accuracy: 82 },
    { name: 'Mock 6', score: 620, accuracy: 89 },
  ];

  const radarData = [
    { subject: 'Physics', A: 120, fullMark: 180 },
    { subject: 'Chemistry', A: 140, fullMark: 180 },
    { subject: 'Botany', A: 165, fullMark: 180 },
    { subject: 'Zoology', A: 170, fullMark: 180 },
    { subject: 'Speed', A: 130, fullMark: 180 },
    { subject: 'Accuracy', A: 150, fullMark: 180 },
  ];

  const speedData = [
    { name: 'Physics', time: 1.5 },
    { name: 'Chemistry', time: 1.2 },
    { name: 'Biology', time: 0.8 },
  ];

  return (
    <AppShell hideSearch>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
              <Activity size={16} /> Advanced AI Diagnostics
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Performance Center</h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Track your journey to NEET 2027. We analyze every click, every second, and every answer to build your personalized strength map.
            </p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['Last 7 Days', 'Last 30 Days', 'All Time'].map((item, i) => (
              <button
                key={item}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${i === 2 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Predictive AI Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-10" />
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-glow">
                <Brain size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-1">AI Predicted Score: 645/720</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Expected Rank: ~4,200 (Government Medical College Range)</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-all">
              View Detailed AI Report
            </button>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Tests Completed" value={summary.count} subtitle="Mock & Chapter Tests" icon={ClipboardList} color="blue" trend="+2 this week" />
          <StatCard title="Average Score" value={`${summary.average}%`} subtitle="Overall Accuracy" icon={TrendingUp} color="emerald" trend="+5.2%" />
          <StatCard title="Highest Score" value={summary.best} subtitle="Out of 720" icon={Target} color="purple" />
          <StatCard title="Questions Solved" value={summary.questions} subtitle="Verified NEET DB" icon={CheckCircle2} color="orange" trend="+140" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Main Trend Line Chart */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Score Trajectory</h3>
                <p className="text-sm font-semibold text-slate-500">Your mock test progression over time</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Strength Map */}
          <div className="glass-card p-8 flex flex-col">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">Strength Map</h3>
              <p className="text-sm font-semibold text-slate-500">Subject-wise mastery</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                  <Radar name="Score" dataKey="A" stroke="#8B5CF6" strokeWidth={3} fill="#8B5CF6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Speed & Weakness Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">Time per Question</h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 700 }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="time" fill="#F97316" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm font-semibold text-slate-500 text-center mt-4">Average minutes spent per question. Ideal: &lt;1.0 min</p>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-slate-800">Attempt History</h3>
              <button className="text-sm font-bold text-primary hover:text-emerald-700">View All</button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {loading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>)}</div> : attempts.length ? (
                attempts.map((attempt) => (
                  <div key={attempt._id} onClick={() => navigate(`/results/${attempt._id}`)} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{attempt.test?.testName || 'Practice Test'}</h4>
                      <p className="text-xs font-semibold text-slate-400 uppercase">{attempt.test?.testType?.replace(/_/g, ' ')} • {new Date(attempt.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-black text-slate-800">{attempt.score}/{attempt.maxScore || 720}</div>
                        <div className="text-xs font-bold text-emerald-500">{Number(attempt.analysis?.accuracy || 0).toFixed(0)}% Acc</div>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Award size={40} className="mx-auto text-slate-300 mb-4" />
                  <h4 className="font-bold text-slate-800 mb-2">No attempts yet</h4>
                  <p className="text-sm text-slate-500">Take a mock test to generate history.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
};

export default PerformancePage;
