import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, ClipboardCheck, Layers3 } from 'lucide-react';
import { nursingAPI } from '../services/api';

const BscNursingSyllabusPage = () => {
  const { subjectSlug, chapterSlug } = useParams();
  const [catalog, setCatalog] = useState({ subjects: [], chapters: [], topics: [] });
  useEffect(() => { nursingAPI.getCatalog().then(response => setCatalog(response.data)).catch(() => {}); }, []);
  const subject = useMemo(() => catalog.subjects.find(item => item.subjectSlug === subjectSlug), [catalog.subjects, subjectSlug]);
  const chapter = useMemo(() => catalog.chapters.find(item => item.chapterSlug === chapterSlug), [catalog.chapters, chapterSlug]);
  const chapters = useMemo(() => catalog.chapters.filter(item => String(item.subjectId) === String(subject?._id)), [catalog.chapters, subject]);
  const topics = useMemo(() => catalog.topics.filter(item => String(item.chapterId) === String(chapter?._id)), [catalog.topics, chapter]);
  const title = chapter ? `${chapter.fullChapterName} for BSc Nursing Entrance` : subject ? `${subject.name} for BSc Nursing Entrance` : 'BSc Nursing Entrance Syllabus';

  useEffect(() => { document.title = `${title} | Medical Mania`; }, [title]);

  if (!catalog.subjects.length) return <main className="min-h-screen bg-slate-950 p-12 text-center text-slate-400">Loading syllabus…</main>;
  if (!subject || (chapterSlug && !chapter)) return <main className="min-h-screen bg-slate-950 p-12 text-center text-white"><h1 className="text-2xl font-bold">Syllabus page not found</h1><Link className="mt-4 inline-block text-emerald-300" to="/bsc-nursing">Return to BSc Nursing</Link></main>;

  const authenticated = Boolean(localStorage.getItem('token'));
  const practiceLink = authenticated ? `/bsc-nursing/question-bank?subject=${subject._id}${chapter ? `&chapter=${chapter._id}` : ''}` : '/login';
  return <main className="min-h-screen bg-slate-950 text-white"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link to="/bsc-nursing" className="font-black">Medical Mania</Link><Link to={authenticated ? '/bsc-nursing/dashboard' : '/login'} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">{authenticated ? 'Dashboard' : 'Sign in'}</Link></nav><section className="mx-auto max-w-6xl px-5 py-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Editable BSc Nursing syllabus</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-slate-300">Use this learning map to move from syllabus coverage to chapter practice, timed mocks, explanations, and measurable performance.</p><Link to={practiceLink} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Practice this area <ArrowRight size={16}/></Link></section>{chapter ? <section className="border-t border-slate-800 bg-slate-900/50"><div className="mx-auto max-w-6xl px-5 py-12"><h2 className="flex items-center gap-2 text-xl font-bold"><Layers3 size={20} className="text-emerald-300"/> Topics and objectives</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{topics.map(topic => <article key={topic._id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><h3 className="font-bold">{topic.name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{topic.learningObjective || `Build a reliable entrance-level understanding of ${topic.name}.`}</p></article>)}{!topics.length && <p className="text-slate-400">Topics will appear as the admin expands this editable chapter.</p>}</div></div></section> : <section className="border-t border-slate-800 bg-slate-900/50"><div className="mx-auto max-w-6xl px-5 py-12"><h2 className="flex items-center gap-2 text-xl font-bold"><BookOpen size={20} className="text-emerald-300"/> Chapters</h2><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{chapters.map(item => <Link key={item._id} to={`/bsc-nursing/${subject.subjectSlug}/${item.chapterSlug}`} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-emerald-400"><h3 className="font-bold">{item.fullChapterName}</h3><p className="mt-2 text-sm text-slate-400">{item.shortDescription || 'Open objectives and start targeted practice.'}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-300">Open chapter <ArrowRight size={14}/></span></Link>)}</div></div></section>}<section className="mx-auto max-w-6xl px-5 py-12"><div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardCheck size={19}/> Content provenance matters</h2><p className="mt-2 text-sm leading-6 text-emerald-100">Official and previous-year material is only displayed when its reuse status is verified. AI practice questions are clearly labelled and are never presented as official past papers.</p></div></section></main>;
};

export default BscNursingSyllabusPage;
