import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus
} from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

const NursingDashboardPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('http://localhost:5000/api/nursing/exams', { headers }),
      axios.get('http://localhost:5000/api/nursing/tests/attempts', { headers })
    ])
      .then(([examsRes, attemptsRes]) => {
        setExams(examsRes.data.data || []);
        setAttempts(attemptsRes.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching dashboard metrics:', err);
        toast.error('Could not load B.Sc. Nursing details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const totalAttempted = completedAttempts.reduce((sum, a) => sum + (a.analysis?.attempted || 0), 0);
    const averageAccuracy = completedAttempts.length
      ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.analysis?.accuracy || 0), 0) / completedAttempts.length)
      : 0;

    return {
      totalAttempted,
      averageAccuracy,
      totalTests: completedAttempts.length,
      streak: 5 // Static/Simulated streak count
    };
  }, [attempts]);

  return (
    <AppShell>
      {loading ? (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8"
        >
          {/* Welcome Banner */}
          <motion.section variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl shadow-emerald-950/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Your B.Sc. Nursing Preparation Dashboard</h1>
                <p className="mt-2 text-emerald-100 max-w-2xl">
                  Track dynamic exam calendars, solve 100+ questions per systematically separated chapter, and test yourself on authentic CBT mock papers.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/nursing/tests')}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 hover:scale-105"
                  >
                    Start CBT Mock Test <Play size={15} className="fill-emerald-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/nursing/practice')}
                    className="rounded-xl border border-emerald-400 bg-emerald-700/30 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700/50"
                  >
                    Chapter Practice
                  </button>
                </div>
              </div>
              <div className="hidden lg:block shrink-0">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                  <span className="text-5xl font-black">100</span>
                  <div className="text-xs font-semibold">
                    <span className="block text-emerald-200">QUESTIONS TARGET</span>
                    <span className="block text-white">Per chapter seeded</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </motion.section>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Flame size={20} /></span>
              <strong className="mt-4 block text-2xl font-bold text-slate-800">{stats.streak} Days</strong>
              <span className="text-xs font-medium text-slate-500">Current Study Streak</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><BookOpen size={20} /></span>
              <strong className="mt-4 block text-2xl font-bold text-slate-800">{stats.totalAttempted}</strong>
              <span className="text-xs font-medium text-slate-500">Questions Practiced</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Award size={20} /></span>
              <strong className="mt-4 block text-2xl font-bold text-slate-800">{stats.averageAccuracy}%</strong>
              <span className="text-xs font-medium text-slate-500">Average Accuracy</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Calendar size={20} /></span>
              <strong className="mt-4 block text-2xl font-bold text-slate-800">{stats.totalTests}</strong>
              <span className="text-xs font-medium text-slate-500">Mock Tests Attempted</span>
            </div>
          </motion.div>

          {/* Supported Exams & Study Roadmap */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <motion.section variants={itemVariants} className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Supported Target Entrance Exams</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {exams.map((exam) => (
                  <div key={exam._id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md">
                    <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{exam.examCode}</span>
                    <h4 className="mt-3 font-bold text-slate-800 group-hover:text-emerald-700">{exam.examName}</h4>
                    <p className="mt-1 text-xs text-slate-500">Authority: {exam.conductingAuthority}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>Questions: {exam.totalQuestions}</span>
                      <span>Duration: {exam.duration} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Daily Planner & Recommendations */}
            <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Today's Assigned Tasks</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Pending</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500 text-white text-[10px] font-bold">1</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Practice Electrostatics</h4>
                    <p className="text-xs text-slate-500">Solve 25 easy and medium questions to review Coulomb's law.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500 text-white text-[10px] font-bold">2</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Attempt General Knowledge Quiz</h4>
                    <p className="text-xs text-slate-500">Test your awareness of Government Health Schemes (PM-JAY).</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/nursing/practice')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Go to Practice Center <ArrowRight size={15} />
              </button>
            </motion.section>
          </div>
        </motion.div>
      )}
    </AppShell>
  );
};

export default NursingDashboardPage;
