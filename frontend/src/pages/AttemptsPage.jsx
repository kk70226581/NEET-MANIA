import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const filters = [
  { value: 'all', label: 'All attempts' },
  { value: 'completed', label: 'Completed' },
  { value: 'progress', label: 'In progress' },
];

const isCompletedAttempt = (attempt) => ['completed', 'submitted'].includes(attempt.status);

const AttemptsPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    testsAPI.getUserAttempts({ limit: 50 })
      .then((response) => {
        if (active) setAttempts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => toast.error(error.message || 'Failed to load attempts.'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const completed = attempts.filter(isCompletedAttempt);
    const inProgress = attempts.length - completed.length;
    const averageAccuracy = completed.length
      ? Math.round(completed.reduce((sum, attempt) => sum + Number(attempt.analysis?.accuracy || 0), 0) / completed.length)
      : 0;
    const bestScorePercent = completed.length
      ? Math.max(...completed.map((attempt) => Math.max(0, (Number(attempt.score || 0) / Number(attempt.maxScore || 720)) * 100)))
      : 0;
    return { completed: completed.length, inProgress, averageAccuracy, bestScorePercent: Math.round(bestScorePercent) };
  }, [attempts]);

  const visibleAttempts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return attempts.filter((attempt) => {
      const completed = isCompletedAttempt(attempt);
      const matchesFilter = filter === 'all' || (filter === 'completed' ? completed : !completed);
      const searchable = `${attempt.test?.testName || 'Practice test'} ${attempt.test?.testType || ''}`.toLowerCase();
      return matchesFilter && (!search || searchable.includes(search));
    });
  }, [attempts, filter, query]);

  const openAttempt = (attempt) => {
    if (isCompletedAttempt(attempt)) navigate(`/results/${attempt._id}`);
    else navigate(`/exam/${attempt.test?._id || attempt.test}`);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-7 p-4 pb-24 md:p-8">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] bg-slate-950 p-7 text-white shadow-float sm:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(59,130,246,.38),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(16,185,129,.22),transparent_32%)]" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-blue-100"><Sparkles size={14} /> Your performance archive</span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Every test tells you what to improve next.</h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-300 sm:text-base">Review completed results, continue unfinished papers, and keep your preparation moving forward.</p>
            </div>
            <button type="button" onClick={() => navigate('/tests')} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-900 shadow-xl transition hover:-translate-y-1 lg:w-auto"><Plus size={18} /> Create new test</button>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total attempts', value: attempts.length, icon: ClipboardList, tone: 'bg-blue-50 text-blue-600' },
            { label: 'Completed', value: summary.completed, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
            { label: 'In progress', value: summary.inProgress, icon: Clock3, tone: 'bg-amber-50 text-amber-600' },
            { label: 'Avg. accuracy', value: `${summary.averageAccuracy}%`, icon: BarChart3, tone: 'bg-purple-50 text-purple-600' },
          ].map(({ label, value, icon: Icon, tone }, index) => (
            <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} key={label} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span>
              <strong className="mt-4 block text-2xl font-black text-slate-800 sm:text-3xl">{loading ? '...' : value}</strong>
              <span className="mt-1 block text-xs font-bold text-slate-500 sm:text-sm">{label}</span>
            </motion.article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center">
            <div><h2 className="text-xl font-black text-slate-800">Test attempts</h2><p className="mt-1 text-sm font-medium text-slate-500">Open an attempt to view its report or continue where you stopped.</p></div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="flex rounded-xl bg-slate-100 p-1">
                {filters.map(({ value, label }) => <button type="button" key={value} onClick={() => setFilter(value)} className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition sm:flex-none ${filter === value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>)}
              </div>
              <label className="relative block min-w-0 sm:w-64">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : visibleAttempts.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Target size={28} /></span>
              <h2 className="mt-5 text-xl font-black text-slate-800">{attempts.length ? 'No matching attempts' : 'No attempts yet'}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{attempts.length ? 'Try a different search or filter.' : 'Build your first NEET practice test. Your progress and result will appear here automatically.'}</p>
              {!attempts.length && <button type="button" onClick={() => navigate('/tests')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"><Plus size={17} /> Build a test</button>}
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
              {visibleAttempts.map((attempt, index) => {
                const completed = isCompletedAttempt(attempt);
                const score = Number(attempt.score || 0);
                const maxScore = Number(attempt.maxScore || 720);
                const accuracy = Math.round(Number(attempt.analysis?.accuracy || 0));
                const scorePercent = Math.max(0, Math.min(100, (score / maxScore) * 100));
                const testType = (attempt.test?.testType || 'custom_test').replace(/_/g, ' ');
                return (
                  <motion.button type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.3) }} whileHover={{ y: -3 }} key={attempt._id} onClick={() => openAttempt(attempt)} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left transition-shadow hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{completed ? <Trophy size={22} /> : <Play size={22} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2"><strong className="truncate text-base font-extrabold text-slate-800 group-hover:text-blue-700">{attempt.test?.testName || 'Practice test'}</strong><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{completed ? 'Completed' : 'In progress'}</span></span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-400"><span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{new Date(attempt.createdAt).toLocaleDateString()}</span><span className="capitalize">{testType}</span></span>
                      </span>
                    </div>

                    {completed ? (
                      <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4">
                        <div><strong className="block text-lg font-black text-slate-800">{score}<span className="text-xs text-slate-400">/{maxScore}</span></strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Score</span></div>
                        <div><strong className="block text-lg font-black text-slate-800">{accuracy}%</strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Accuracy</span></div>
                        <div><strong className="block text-lg font-black text-slate-800">{attempt.analysis?.totalQuestionsAttempted || 0}</strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Attempted</span></div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-2xl bg-amber-50 p-4"><span className="flex items-center justify-between text-xs font-bold text-amber-700"><span>Paper saved safely</span><span>Ready to resume</span></span><span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-amber-100"><span className="block h-full w-1/3 rounded-full bg-amber-400" /></span></div>
                    )}

                    {completed && <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-slate-100"><motion.span initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }} transition={{ duration: 0.7, delay: 0.15 }} className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" /></span>}
                    <span className="mt-5 flex items-center justify-between text-sm font-extrabold text-blue-600"><span>{completed ? 'View detailed result' : 'Resume test'}</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default AttemptsPage;
