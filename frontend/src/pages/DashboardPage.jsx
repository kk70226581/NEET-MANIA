import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  AlarmClock,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Clock,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Share2
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

const metricStyles = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

const MetricCard = ({ title, value, subtitle, icon: Icon, tone }) => (
  <motion.article variants={itemVariants} whileHover={{ y: -5 }} className="glass-card group relative overflow-hidden p-6">
    <span className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${metricStyles[tone]}`}><Icon size={23} /></span>
    <strong className="block text-3xl font-black tracking-tight text-slate-800">{value}</strong>
    <span className="mt-1 block text-sm font-extrabold text-slate-600">{title}</span>
    <span className="mt-1 block text-xs font-semibold text-slate-400">{subtitle}</span>
    <span className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${metricStyles[tone].split(' ')[0]}`} />
  </motion.article>
);

const activityColors = ['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideStep, setGuideStep] = useState(0);

  const guideSteps = [
    {
      title: "1. Navigate to Mock Tests Page",
      desc: "To get started, click on 'Start practice' in the banner above or navigate to the 'Mock Tests' tab in the left sidebar.",
      actionText: "Go to Mock Tests Page",
      icon: Play,
      action: () => navigate('/tests')
    },
    {
      title: "2. Choose Your Test Type",
      desc: "On the Mock Tests page, select the type of test you'd like to attempt (e.g. Chapter Test, Topic Drill, PYQ Test, or a Full NEET Mock).",
      actionText: "Next Step",
      icon: Target,
      action: () => setGuideStep(2)
    },
    {
      title: "3. Customize Your Configuration",
      desc: "Choose the Class (11 or 12), Subject, Chapter, Difficulty level, and number of questions you want in this practice session.",
      actionText: "Next Step",
      icon: BookOpen,
      action: () => setGuideStep(3)
    },
    {
      title: "4. Start and Complete Your Exam!",
      desc: "Once configured, click the 'Start Exam' button. The exam interface will load, allowing you to answer NEET-pattern questions with auto-saving.",
      actionText: "Let's Build a Test!",
      icon: Sparkles,
      action: () => navigate('/tests')
    }
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.firstName || 'Aspirant';
  const daysToExam = Math.max(0, Math.ceil((new Date('2027-05-02') - new Date()) / 86400000));

  useEffect(() => {
    let active = true;
    testsAPI.getUserAttempts({ limit: 100 })
      .then((response) => {
        if (active) setAttempts(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const completed = attempts.filter((attempt) => ['submitted', 'completed'].includes(attempt.status));
    const totalQuestions = completed.reduce((sum, attempt) => sum + Number(attempt.analysis?.totalQuestionsAttempted || 0), 0)
      || Number(user?.statistics?.totalQuestionsAttempted || 0);
    const averageAccuracy = completed.length
      ? Math.round(completed.reduce((sum, attempt) => sum + Number(attempt.analysis?.accuracy || 0), 0) / completed.length)
      : Math.round(Number(user?.statistics?.totalAccuracy || 0));
    const todayKey = new Date().toDateString();
    const todayQuestions = completed
      .filter((attempt) => new Date(attempt.updatedAt || attempt.createdAt).toDateString() === todayKey)
      .reduce((sum, attempt) => sum + Number(attempt.analysis?.totalQuestionsAttempted || 0), 0);
    const goal = 100;
    const goalPercent = Math.min(100, Math.round((todayQuestions / goal) * 100));

    const activity = Array.from({ length: 84 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (83 - index));
      const count = completed
        .filter((attempt) => new Date(attempt.updatedAt || attempt.createdAt).toDateString() === date.toDateString())
        .reduce((sum, attempt) => sum + Number(attempt.analysis?.totalQuestionsAttempted || 0), 0);
      return { level: count ? Math.min(4, Math.ceil(count / 25)) : 0, label: `${date.toLocaleDateString()}: ${count} questions` };
    });

    return {
      completed,
      totalQuestions,
      averageAccuracy,
      todayQuestions,
      goal,
      goalPercent,
      activity,
      streak: Number(user?.statistics?.studyStreak || 0),
      rank: user?.statistics?.estimatedRank ? `#${user.statistics.estimatedRank}` : '—',
    };
  }, [attempts, user]);

  const weakArea = user?.weakChapters?.[0] || 'Your lowest-scoring chapter';
  const strongArea = user?.strongChapters?.[0] || 'Your strongest chapter';
  const remainingQuestions = Math.max(0, data.goal - data.todayQuestions);

  const quickActions = [
    { title: 'Build a mock test', copy: 'Choose chapters, difficulty, and length.', icon: Play, to: '/tests', tone: 'bg-blue-600 text-white' },
    { title: 'Review mistakes', copy: 'Turn wrong answers into revision wins.', icon: RotateCcw, to: '/mistakes', tone: 'bg-purple-50 text-purple-700' },
    { title: 'Memory challenge', copy: 'Five questions before a concept fades.', icon: AlarmClock, to: '/memory-challenge', tone: 'bg-amber-50 text-amber-700' },
    { title: 'Ask AI Mentor', copy: 'Get a step-by-step explanation in Hinglish.', icon: BrainCircuit, to: '/mentor', tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-8 p-4 pb-24 md:p-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-float sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(59,130,246,.45),transparent_32%),radial-gradient(circle_at_15%_100%,rgba(16,185,129,.30),transparent_35%)]" />
          <motion.div animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} className="absolute -right-12 top-12 h-52 w-52 rounded-full border border-white/10 bg-white/5 blur-sm" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100 backdrop-blur"><Sparkles size={15} /> Small steps. Stronger scores.</span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{greeting}, <span className="text-emerald-300">{name}.</span></h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-300 sm:text-lg">Your preparation workspace is ready. Continue today's plan, practise a weak area, or build a fresh NEET-pattern mock.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => navigate('/tests')} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 font-extrabold text-slate-900 shadow-xl transition hover:-translate-y-1"><Play size={19} className="fill-blue-600 text-blue-600" /> Start practice</button>
                <button onClick={() => navigate('/study-plan')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"><BookOpen size={19} /> Today's plan</button>
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-between rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl sm:w-auto sm:min-w-64 sm:flex-col sm:justify-center sm:p-7 sm:text-center">
              <Timer className="text-blue-200" size={30} />
              <div><strong className="block text-5xl font-black tracking-tighter sm:mt-3">{daysToExam}</strong><span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Days to NEET</span></div>
            </div>
          </div>
        </motion.section>

        {/* Guided Mock Test Tour */}
        <motion.section 
          initial={{ opacity: 0, y: 18 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-emerald-50/50 border border-slate-200/60 rounded-3xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 text-blue-700 text-xs font-bold border border-blue-200 mb-3">
                <Sparkles size={13} /> Interactive Tour
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">How to build & take a Mock Test</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">
                Follow these simple steps to customize your practice and build exam temperament.
              </p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-stretch sm:self-auto justify-between">
              {[0, 1, 2, 3].map((step) => (
                <button 
                  key={step} 
                  onClick={() => setGuideStep(step)} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    guideStep === step ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Step {step + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-lg font-bold text-slate-800">
                {guideSteps[guideStep].title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {guideSteps[guideStep].desc}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {guideStep > 0 && (
                  <button 
                    onClick={() => setGuideStep(curr => curr - 1)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={guideSteps[guideStep].action}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {guideSteps[guideStep].actionText}
                </button>
              </div>
            </div>
            <div className="md:col-span-4 bg-white/60 p-5 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                {React.createElement(guideSteps[guideStep].icon, { size: 24 })}
              </span>
              <strong className="block text-sm text-slate-700 mb-1">Interactive Action</strong>
              <p className="text-xs text-slate-400 font-medium">Click the button to try it out or go to the next step!</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={containerVariants} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Questions solved" value={loading ? '...' : data.totalQuestions.toLocaleString()} subtitle="From your completed attempts" icon={Target} tone="blue" />
          <MetricCard title="Average accuracy" value={loading ? '...' : `${data.averageAccuracy}%`} subtitle="Across completed tests" icon={TrendingUp} tone="emerald" />
          <MetricCard title="Study streak" value={`${data.streak} days`} subtitle="Keep the momentum going" icon={Flame} tone="orange" />
          <MetricCard title="Estimated rank" value={data.rank} subtitle="Updates with your performance" icon={Trophy} tone="purple" />
        </motion.section>

        <section className="grid gap-7 xl:grid-cols-3">
          <motion.article variants={itemVariants} initial="hidden" animate="show" className="glass-card p-6 sm:p-8 xl:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Last 12 weeks</span><h2 className="mt-1 text-xl font-black text-slate-800">Practice consistency</h2><p className="mt-1 text-sm font-medium text-slate-500">Each square reflects questions attempted that day.</p></div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">Less {[0, 1, 2, 3, 4].map((level) => <span key={level} className={`h-3 w-3 rounded-[3px] ${activityColors[level]}`} />)} More</div>
            </div>
            <div className="mt-8 grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-3 no-scrollbar">
              {data.activity.map((day, index) => <span title={day.label} key={index} className={`h-3.5 w-3.5 rounded-[3px] ${activityColors[day.level]} ring-emerald-300 ring-offset-1 transition hover:scale-125 hover:ring-2`} />)}
            </div>
          </motion.article>

          <motion.article variants={itemVariants} initial="hidden" animate="show" className="glass-card flex flex-col items-center p-7 text-center">
            <h2 className="text-xl font-black text-slate-800">Today's goal</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{data.goal} questions</p>
            <div className="relative my-5 h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                <motion.circle initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 * (1 - data.goalPercent / 100) }} transition={{ duration: 1, ease: 'easeOut' }} cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="10" fill="none" strokeDasharray="251.2" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 grid place-items-center"><div><strong className="block text-3xl font-black text-slate-800">{data.goalPercent}%</strong><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">complete</span></div></div>
            </div>
            <button onClick={() => navigate('/tests')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-600 hover:text-white"><Clock size={16} /> {remainingQuestions ? `${remainingQuestions} questions left` : 'Goal completed'}</button>
          </motion.article>
        </section>

        <section className="grid gap-7 xl:grid-cols-5">
          <motion.article variants={itemVariants} initial="hidden" animate="show" className="glass-card p-6 sm:p-8 xl:col-span-3">
            <div className="mb-6 flex items-center justify-between"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Quick start</span><h2 className="mt-1 text-xl font-black text-slate-800">What would you like to do?</h2></div></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map(({ title, copy, icon: Icon, to, tone }) => (
                <motion.button whileHover={{ y: -4 }} type="button" key={title} onClick={() => navigate(to)} className={`rounded-2xl p-5 text-left transition-shadow hover:shadow-lg ${tone}`}>
                  <Icon size={23} /><strong className="mt-6 block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 opacity-75">{copy}</span><ArrowRight className="mt-4" size={17} />
                </motion.button>
              ))}
            </div>
          </motion.article>

          <motion.article variants={itemVariants} initial="hidden" animate="show" className="glass-card p-6 sm:p-8 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between"><div><span className="text-xs font-bold uppercase tracking-[0.16em] text-purple-600">Recent activity</span><h2 className="mt-1 text-xl font-black text-slate-800">Your latest tests</h2></div><button onClick={() => navigate('/attempts')} className="text-xs font-bold text-blue-600">View all</button></div>
            {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : data.completed.length ? (
              <div className="space-y-2">
                {data.completed.slice(0, 4).map((attempt) => (
                  <div 
                    key={attempt._id} 
                    onClick={() => navigate(`/results/${attempt._id}`)} 
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Target size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-slate-800">{attempt.test?.testName || 'Practice test'}</strong>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {new Date(attempt.createdAt).toLocaleDateString()} · {Math.round(Number(attempt.analysis?.accuracy || 0))}% accuracy
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      {attempt.test && (
                        <button
                          type="button"
                          title="Share Test Link"
                          onClick={(e) => {
                            e.stopPropagation();
                            const testId = attempt.test?._id || attempt.test;
                            const shareUrl = `${window.location.origin}/exam/${testId}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Test link copied to clipboard!');
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Share2 size={15} />
                        </button>
                      )}
                      <ChevronRight size={17} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-7 text-center"><Target className="mx-auto text-slate-300" size={30} /><h3 className="mt-3 font-bold text-slate-700">No completed tests yet</h3><p className="mt-1 text-xs leading-5 text-slate-500">Finish your first test to see real insights here.</p><button onClick={() => navigate('/tests')} className="mt-4 text-sm font-bold text-blue-600">Start a test</button></div>
            )}
          </motion.article>
        </section>

        <motion.section variants={itemVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
          <button onClick={() => navigate('/tests')} className="glass-card flex items-center gap-4 p-5 text-left"><span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.7)]" /><span className="flex-1"><strong className="block text-sm text-slate-800">Focus next: {weakArea}</strong><span className="text-xs text-slate-500">Create a targeted test for this chapter.</span></span><ChevronRight size={18} className="text-slate-300" /></button>
          <button onClick={() => navigate('/performance')} className="glass-card flex items-center gap-4 p-5 text-left"><span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,.7)]" /><span className="flex-1"><strong className="block text-sm text-slate-800">Keep strong: {strongArea}</strong><span className="text-xs text-slate-500">Use a short drill to retain your edge.</span></span><ChevronRight size={18} className="text-slate-300" /></button>
        </motion.section>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
