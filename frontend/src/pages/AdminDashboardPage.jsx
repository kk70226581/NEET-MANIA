import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  AlertCircle,
  Clock3,
  Database,
  Gauge,
  Globe2,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { adminAPI } from '../services/api';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatUptime = (seconds) => {
  const hours = Math.floor(Number(seconds || 0) / 3600);
  const minutes = Math.floor((Number(seconds || 0) % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const metricCards = (metrics) => [
  { label: 'Registered students', value: formatNumber(metrics.totalStudents), note: `+${formatNumber(metrics.newStudents)} this week`, icon: Users, tone: 'from-blue-500 to-cyan-400' },
  { label: 'Active students', value: formatNumber(metrics.activeStudents), note: 'Accounts currently enabled', icon: GraduationCap, tone: 'from-emerald-500 to-teal-400' },
  { label: 'Question bank', value: formatNumber(metrics.totalQuestions), note: `${formatNumber(metrics.publishedQuestions)} published`, icon: BookOpenCheck, tone: 'from-violet-500 to-purple-400' },
  { label: 'Test activity', value: formatNumber(metrics.totalAttempts), note: `${formatNumber(metrics.recentAttempts)} attempts this week`, icon: Activity, tone: 'from-orange-500 to-amber-400' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getOverview();
      setOverview(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Could not load the platform overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, []);

  const metrics = overview?.metrics || {};
  const cards = metricCards(metrics);
  const systemHealthy = overview?.service?.api === 'operational' && overview?.service?.database === 'connected';

  return (
    <AppShell hideSearch>
      <main className="mx-auto w-full max-w-[1500px] space-y-7 p-4 pb-24 md:p-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-2xl sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(16,185,129,.28),transparent_29%),radial-gradient(circle_at_14%_100%,rgba(59,130,246,.35),transparent_36%)]" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-200"><ShieldCheck size={15} /> OWNER CONTROL CENTRE</span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Medical Mania <span className="text-emerald-300">Admin</span></h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">A live view of your learners, content, tests, and core platform services—all in one private workspace.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${systemHealthy ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/20 bg-amber-400/10 text-amber-200'}`}><span className={`h-2.5 w-2.5 rounded-full ${systemHealthy ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-amber-400'}`} />{systemHealthy ? 'All systems operational' : 'Needs attention'}</span>
              <button type="button" onClick={loadOverview} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
            </div>
          </div>
        </section>

        {error && <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="mt-0.5 shrink-0" size={18} /><div><strong className="block">Dashboard data is unavailable</strong>{error}</div></section>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, note, icon: Icon, tone }) => (
            <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${tone}`}><Icon size={21} /></span>
              <strong className="mt-6 block text-3xl font-black tracking-tight text-slate-900">{loading ? '—' : value}</strong>
              <span className="mt-1 block text-sm font-extrabold text-slate-700">{label}</span>
              <span className="mt-1 block text-xs font-medium text-slate-400">{loading ? 'Loading live data…' : note}</span>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
            <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">Content intelligence</span><h2 className="mt-1 text-xl font-black text-slate-900">Question bank coverage</h2><p className="mt-1 text-sm text-slate-500">See which subjects have the most available questions.</p></div><Database className="text-violet-500" size={24} /></div>
            <div className="mt-7 space-y-4">
              {(overview?.subjectDistribution || []).length ? overview.subjectDistribution.map(({ subject, count }) => {
                const total = Math.max(metrics.totalQuestions || 1, 1);
                const percentage = Math.round((count / total) * 100);
                return <div key={subject}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-bold capitalize text-slate-700">{subject}</span><span className="font-semibold text-slate-400">{formatNumber(count)} · {percentage}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" /></div></div>;
              }) : <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">No question distribution is available yet.</div>}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-amber-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-amber-700">Needs review</span><strong className="mt-1 block text-2xl font-black text-amber-900">{formatNumber(metrics.pendingQuestions)}</strong><span className="text-xs text-amber-700">Questions pending publication</span></div><div className="rounded-xl bg-emerald-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live tests</span><strong className="mt-1 block text-2xl font-black text-emerald-900">{formatNumber(metrics.publishedTests)}</strong><span className="text-xs text-emerald-700">Published, active test sets</span></div></div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-start justify-between"><div><span className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Platform health</span><h2 className="mt-1 text-xl font-black text-slate-900">Service status</h2></div><Gauge className="text-blue-500" size={24} /></div>
            <div className="mt-6 space-y-3">
              {[['API service', overview?.service?.api], ['Database', overview?.service?.database]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-bold text-slate-700">{label}</span><span className={`inline-flex items-center gap-2 text-xs font-bold ${value === 'connected' || value === 'operational' ? 'text-emerald-600' : 'text-amber-600'}`}><span className={`h-2 w-2 rounded-full ${value === 'connected' || value === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />{value || 'Checking'}</span></div>)}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-bold text-slate-700">Server uptime</span><span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 size={14} />{loading ? '—' : formatUptime(overview?.service?.uptimeSeconds)}</span></div>
            </div>
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-blue-900"><Globe2 size={16} /> {overview?.company?.name || 'Medical Mania'}</div><a className="mt-1 block truncate text-xs font-medium text-blue-600 hover:underline" href={overview?.company?.website} target="_blank" rel="noreferrer">{overview?.company?.website || 'Add COMPANY_WEBSITE_URL'}</a><p className="mt-3 text-xs leading-5 text-blue-800">Support: {overview?.company?.supportEmail || 'Add COMPANY_SUPPORT_EMAIL'}</p></div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3"><div className="flex items-center justify-between"><div><span className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">Growth</span><h2 className="mt-1 text-xl font-black text-slate-900">Newest students</h2></div><Users className="text-emerald-500" size={23} /></div><div className="mt-5 divide-y divide-slate-100">{(overview?.recentStudents || []).length ? overview.recentStudents.map((student) => <div key={student._id} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-600">{`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-800">{student.firstName} {student.lastName}</strong><span className="block truncate text-xs text-slate-400">{student.email}</span></div><span className="text-right text-xs font-semibold text-slate-400">{new Date(student.createdAt).toLocaleDateString('en-IN')}</span></div>) : <div className="py-8 text-center text-sm text-slate-500">New learner accounts will appear here.</div>}</div></article>
          <article className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg xl:col-span-2"><Sparkles size={25} className="text-blue-200" /><h2 className="mt-5 text-2xl font-black">Admin shortcuts</h2><p className="mt-2 text-sm leading-6 text-blue-100">Keep content accurate and the student experience ready.</p><div className="mt-6 space-y-2"><button type="button" onClick={() => navigate('/admin/questions')} className="flex w-full items-center justify-between rounded-xl bg-white/15 px-4 py-3 text-left text-sm font-bold transition hover:bg-white/25">Review question bank <ArrowRight size={16} /></button><button type="button" onClick={() => navigate('/admin/pyq')} className="flex w-full items-center justify-between rounded-xl bg-white/15 px-4 py-3 text-left text-sm font-bold transition hover:bg-white/25">Manage PYQ quality <ArrowRight size={16} /></button></div></article>
        </section>
      </main>
    </AppShell>
  );
}
