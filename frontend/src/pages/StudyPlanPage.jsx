import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, CalendarCheck2, CheckCircle2, Clock3, Dumbbell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { mistakesAPI } from '../services/api';

const StudyPlanPage = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  useEffect(() => {
    mistakesAPI.getMistakes({ status: 'pending' }).then((response) => setMistakes(response.data || [])).catch(() => {});
  }, []);

  const weakChapters = useMemo(() => {
    const counts = mistakes.reduce((map, item) => {
      const chapter = item.questionDetails?.chapter;
      if (chapter) map[chapter] = (map[chapter] || 0) + 1;
      return map;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [mistakes]);

  const tasks = [
    { title: `Revise ${weakChapters[0]?.[0] || 'your weakest chapter'}`, meta: '35 min · NCERT recall', icon: BookOpenCheck, tone: 'cyan' },
    { title: `Solve ${Math.max(15, Math.min(30, mistakes.length || 20))} focused questions`, meta: '40 min · Medium difficulty', icon: Dumbbell, tone: 'yellow' },
    { title: 'Review your mistake notebook', meta: `${mistakes.length} pending items · 25 min`, icon: CheckCircle2, tone: 'green' },
    { title: 'Finish with a timed topic drill', meta: '15 questions · Exam mode', icon: Clock3, tone: 'pink' },
  ];

  return (
    <AppShell eyebrow="Daily preparation" title="Study plan">
      <section className="plan-hero">
        <div><span className="product-badge"><Sparkles size={15} /> Today’s plan</span><h2>A realistic day beats an impossible timetable.</h2><p>This plan uses your pending mistakes to prioritise revision. Complete the loop: recall, practise, review, retest.</p><div className="plan-duration"><Clock3 size={18} /><strong>2 hr 20 min</strong><span>estimated focused time</span></div></div>
        <div className="plan-date"><CalendarCheck2 size={28} /><strong>{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</strong><span>{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</span></div>
      </section>
      <section className="plan-layout">
        <div className="chalk-card daily-tasks">
          <div className="section-heading"><div><p className="student-eyebrow">Four-step loop</p><h2>Today’s focused work</h2></div></div>
          {tasks.map(({ title, meta, icon: Icon, tone }, index) => (
            <div className="daily-task" key={title}><span className={`tone-${tone}`}><Icon size={19} /></span><div><small>Step {index + 1}</small><strong>{title}</strong><p>{meta}</p></div><button aria-label={`Open ${title}`} onClick={() => index === 2 ? navigate('/mistakes') : navigate('/tests')}><ArrowRight size={16} /></button></div>
          ))}
        </div>
        <aside className="plan-side">
          <div className="chalk-card priority-card"><p className="student-eyebrow">Priority chapters</p><h2>Revise these first</h2>{weakChapters.length ? weakChapters.map(([chapter, count], index) => <div key={chapter}><span>0{index + 1}</span><p><strong>{chapter}</strong><small>{count} unresolved mistake{count > 1 ? 's' : ''}</small></p></div>) : <p className="plan-empty">Complete a test to generate personal priorities.</p>}</div>
          <button className="plan-test-cta" onClick={() => navigate('/tests')}><Dumbbell size={22} /><span><strong>Start focused practice</strong><small>Generate a test from the verified bank</small></span><ArrowRight size={17} /></button>
        </aside>
      </section>
    </AppShell>
  );
};

export default StudyPlanPage;
