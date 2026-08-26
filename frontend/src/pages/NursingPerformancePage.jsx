import React, { useEffect, useState } from 'react';
import { BarChart3, BookMarked, CheckCircle2, XCircle, Target } from 'lucide-react';
import AppShell from '../components/AppShell';
import { nursingAPI } from '../services/api';

const NursingPerformancePage = () => {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { nursingAPI.getAnalytics().then(response => setAnalytics(response.data)).catch(() => setAnalytics({})); }, []);
  if (!analytics) return <AppShell><div className="py-24 text-center">Loading analytics…</div></AppShell>;
  const cards = [
    ['Attempted', analytics.totalAttempted || 0, Target, 'bg-indigo-50 text-indigo-700'],
    ['Accuracy', `${analytics.accuracy || 0}%`, CheckCircle2, 'bg-emerald-50 text-emerald-700'],
    ['Incorrect', analytics.totalIncorrect || 0, XCircle, 'bg-rose-50 text-rose-700'],
    ['Bookmarks', analytics.bookmarks || 0, BookMarked, 'bg-amber-50 text-amber-700']
  ];
  return <AppShell><div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6"><header><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Actual practice data</p><h1 className="mt-2 text-3xl font-black text-slate-900">Performance analytics</h1></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon, color]) => <div key={label} className="rounded-2xl border bg-white p-5"><span className={`inline-flex rounded-xl p-2 ${color}`}><Icon size={20} /></span><strong className="mt-5 block text-3xl text-slate-900">{value}</strong><span className="text-sm text-slate-500">{label}</span></div>)}</div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 font-bold"><BarChart3 size={19} /> Subject accuracy</h2><div className="mt-5 space-y-4">{(analytics.subjectPerformance || []).map(item => <div key={item.name}><div className="mb-1 flex justify-between text-sm"><span>{item.name}</span><b>{item.accuracy}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.accuracy}%` }} /></div></div>)}</div></section><section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">Recommended next practice</h2><div className="mt-4 space-y-3">{(analytics.recommendations || []).length ? analytics.recommendations.map(item => <p key={item} className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">{item}</p>) : <p className="text-sm text-slate-500">Attempt at least three questions in a chapter to unlock evidence-based recommendations.</p>}</div></section></div></div></AppShell>;
};

export default NursingPerformancePage;
