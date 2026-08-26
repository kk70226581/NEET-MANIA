import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BrainCircuit, CalendarDays, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { nursingAPI } from '../services/api';

const BscNursingHubPage = () => {
  const [catalog, setCatalog] = useState({ exams: [], subjects: [], chapters: [] });
  const authenticated = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    nursingAPI.getCatalog().then(response => setCatalog(response.data)).catch(() => {});
    document.title = 'BSc Nursing Entrance Preparation | Medical Mania';
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link to="/" className="text-lg font-black tracking-tight">Medical Mania</Link>
        <Link to={authenticated ? '/bsc-nursing/dashboard' : '/login'} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
          {authenticated ? 'Open dashboard' : 'Sign in to practice'}
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-14 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">BSc Nursing Entrance Hub</span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">One source-aware question bank for every nursing entrance you target.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Study exam-specific syllabi, practice by chapter and difficulty, take timed mocks, revisit wrong answers, and improve from real performance data.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={authenticated ? '/bsc-nursing/question-bank' : '/login'} className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950">Explore question bank</Link>
            <Link to={authenticated ? '/bsc-nursing/mock-tests' : '/login'} className="rounded-xl border border-slate-700 px-6 py-3 font-bold">Take a mock test</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            [catalog.exams.length, 'Exam profiles', CalendarDays],
            [catalog.subjects.length, 'Subjects', BookOpen],
            [catalog.chapters.length, 'Editable chapters', BrainCircuit],
            ['Human', 'review before publish', ShieldCheck]
          ].map(([value, label, Icon]) => (
            <div key={label} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <Icon className="text-emerald-400" />
              <strong className="mt-8 block text-2xl font-black">{value}</strong>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3">
          {[
            [ClipboardCheck, 'Practice with context', 'Filter by exam, subject, chapter, topic, difficulty, year, language, or source.'],
            [CheckCircle2, 'Trust the labels', 'Official, permitted, reference-only, and AI practice content remain clearly distinct.'],
            [BrainCircuit, 'Learn from mistakes', 'Answers update your weak areas, wrong-question bank, and personalized recommendations.']
          ].map(([Icon, title, text]) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <Icon className="text-emerald-400" />
              <h2 className="mt-5 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default BscNursingHubPage;
