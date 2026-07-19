import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlarmClock, ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Clock3, Flame, RotateCcw, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { retentionAPI } from '../services/api';

const answers = ['A', 'B', 'C', 'D'];
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const ForgettingCurvePage = () => {
  const [overview, setOverview] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [selected, setSelected] = useState({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(120);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await retentionAPI.getDue();
      setOverview(response.data);
    } catch (error) {
      toast.error(error.message || 'Could not load your memory schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const start = async (chapter) => {
    setLoading(true);
    try {
      const response = await retentionAPI.start(chapter);
      setChallenge(response.data);
      setSelected({});
      setIndex(0);
      setSeconds(response.data.durationSeconds || 120);
      setResult(null);
    } catch (error) {
      toast.error(error.message || 'Could not start this challenge.');
    } finally {
      setLoading(false);
    }
  };

  const submit = useCallback(async () => {
    if (!challenge || submitting || result) return;
    setSubmitting(true);
    try {
      const response = await retentionAPI.submit(challenge.challengeId, selected);
      setResult(response.data);
      setChallenge(null);
      await loadOverview();
    } catch (error) {
      toast.error(error.message || 'Could not submit the challenge.');
    } finally {
      setSubmitting(false);
    }
  }, [challenge, loadOverview, result, selected, submitting]);

  useEffect(() => {
    if (!challenge || result) return undefined;
    if (seconds <= 0) {
      submit();
      return undefined;
    }
    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [challenge, result, seconds, submit]);

  const question = challenge?.questions?.[index];
  const answered = Object.keys(selected).length;
  const dueTopic = overview?.due?.[0];
  const progress = challenge ? ((index + 1) / challenge.questions.length) * 100 : 0;
  const scoreTone = useMemo(() => result?.score >= 4 ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500', [result]);

  if (loading && !overview && !challenge) {
    return <AppShell><div className="grid min-h-[70vh] place-items-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /></div></AppShell>;
  }

  return (
    <AppShell hideSearch>
      <div className="min-h-full bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_34%),linear-gradient(180deg,#f8fafc,#eef2ff)] px-4 py-7 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-700"><BrainCircuit size={15} /> Memory Lab</span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Forgetting Curve Challenge</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Five questions. Two minutes. Retrieval happens just before a concept is likely to fade.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-lg shadow-indigo-950/5 backdrop-blur">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600"><Flame size={20} /></span>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Memory XP</p><p className="text-xl font-black text-slate-900">{dueTopic?.xp || 0}</p></div>
            </div>
          </div>

          {!challenge && !result && (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 p-7 text-white shadow-2xl shadow-indigo-900/20 sm:p-9">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur"><AlarmClock size={15} /> Retrieval window open</span>
                <h2 className="relative mt-7 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">{overview?.headline}</h2>
                <p className="relative mt-4 max-w-2xl text-sm leading-6 text-blue-100">{overview?.method}</p>
                <div className="relative mt-8 flex flex-wrap gap-3">
                  <button type="button" disabled={loading} onClick={() => start(dueTopic?.chapter)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50"><Sparkles size={18} /> Start 2-minute challenge</button>
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold"><Clock3 size={17} /> 5 questions · 120 seconds</span>
                </div>
              </motion.section>

              <section className="rounded-[2rem] border border-white bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
                <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">Memory forecast</h3><ShieldCheck className="text-emerald-500" size={22} /></div>
                {dueTopic ? (
                  <div className="mt-6">
                    <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Most urgent</p><p className="mt-1 font-extrabold text-slate-800">{dueTopic.chapter}</p></div><span className="text-3xl font-black text-indigo-600">{dueTopic.retention}%</span></div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${dueTopic.retention}%` }} className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" /></div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-black text-slate-900">{dueTopic.strengthDays}d</p><p className="text-xs font-semibold text-slate-500">Memory strength</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-black text-slate-900">{dueTopic.consecutivePasses}</p><p className="text-xs font-semibold text-slate-500">Pass streak</p></div></div>
                  </div>
                ) : <p className="mt-8 text-sm text-slate-500">No urgent topic—take a maintenance round to keep recall high.</p>}
              </section>
            </div>
          )}

          {challenge && question && (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white sm:px-8">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Rapid retrieval</p><h2 className="mt-1 text-lg font-black">{challenge.chapter}</h2></div>
                <div className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 font-mono text-xl font-black ${seconds <= 20 ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-cyan-200'}`}><AlarmClock size={20} /> {formatTime(seconds)}</div>
              </div>
              <div className="h-1.5 bg-slate-100"><motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500" /></div>
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-6 flex items-center justify-between"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">Question {index + 1} of 5</span><span className="text-xs font-bold text-slate-400">{answered}/5 answered</span></div>
                <h3 className="whitespace-pre-line text-lg font-bold leading-8 text-slate-900 sm:text-xl">{question.questionText}</h3>
                <div className="mt-7 grid gap-3">
                  {answers.map((answer) => {
                    const active = selected[String(question._id)] === answer;
                    return <button type="button" key={answer} onClick={() => setSelected((current) => ({ ...current, [String(question._id)]: answer }))} className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${active ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-900/5 ring-2 ring-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'}`}>{answer}</span><span className="pt-2 text-sm font-semibold leading-6 text-slate-700 sm:text-base">{question.options?.[answer]?.text}</span></button>;
                  })}
                </div>
                <div className="mt-8 flex items-center justify-between gap-3"><button type="button" disabled={index === 0} onClick={() => setIndex((current) => current - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-30"><ArrowLeft size={17} /> Previous</button>{index < 4 ? <button type="button" onClick={() => setIndex((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Next <ArrowRight size={17} /></button> : <button type="button" disabled={submitting} onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"><CheckCircle2 size={17} /> {submitting ? 'Checking…' : 'Finish challenge'}</button>}</div>
              </div>
            </section>
          )}

          {result && (
            <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-slate-900/10">
              <div className={`bg-gradient-to-r ${scoreTone} p-8 text-center text-white`}><Trophy className="mx-auto mb-3" size={42} /><p className="text-sm font-bold uppercase tracking-[0.18em]">Challenge complete</p><h2 className="mt-2 text-5xl font-black">{result.score}/5</h2><p className="mt-2 font-semibold">+{result.xpEarned} memory XP · {result.message}</p></div>
              <div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr] lg:p-8">
                <div className="space-y-3"><div className="rounded-2xl bg-indigo-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Memory strength</p><p className="mt-2 text-2xl font-black text-indigo-950">{result.strengthBefore}d → {result.strengthAfter}d</p></div><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Next retrieval</p><p className="mt-2 font-extrabold text-slate-800">{formatDate(result.nextReviewAt)}</p></div><button type="button" onClick={() => { setResult(null); start(dueTopic?.chapter); }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white"><RotateCcw size={17} /> Play another round</button></div>
                <div><h3 className="mb-3 text-lg font-black text-slate-900">Answer review</h3><div className="space-y-3">{result.review.map((item, itemIndex) => <div key={item.questionId} className={`rounded-2xl border p-4 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}><div className="flex gap-3"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black text-white ${item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>{itemIndex + 1}</span><div><p className="whitespace-pre-line text-sm font-bold text-slate-800">{item.questionText}</p><p className="mt-2 text-xs font-semibold text-slate-600">Correct: {item.correctOption} · {item.correctAnswer}</p>{item.ncertReference?.pdfPage && <p className="mt-1 text-xs text-slate-500">NCERT reference: PDF page {item.ncertReference.pdfPage}</p>}</div></div></div>)}</div></div>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default ForgettingCurvePage;
