import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, CalendarCheck2, CheckCircle2, Clock3, Dumbbell, Sparkles, BrainCircuit, Loader2, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../components/AppShell';
import { mistakesAPI, mentorAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudyPlanPage = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState('');

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
    { title: `Revise ${weakChapters[0]?.[0] || 'your weakest chapter'}`, meta: '35 min · NCERT recall', icon: BookOpenCheck, colorClass: 'text-cyan-600 bg-cyan-100 border-cyan-200' },
    { title: `Solve ${Math.max(15, Math.min(30, mistakes.length || 20))} focused questions`, meta: '40 min · Medium difficulty', icon: Dumbbell, colorClass: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
    { title: 'Review your mistake notebook', meta: `${mistakes.length} pending items · 25 min`, icon: CheckCircle2, colorClass: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
    { title: 'Finish with a timed topic drill', meta: '15 questions · Exam mode', icon: Clock3, colorClass: 'text-pink-600 bg-pink-100 border-pink-200' },
  ];

  const generateAIPlan = async () => {
    if (mistakes.length === 0) {
      toast.error("You don't have enough mistakes to analyze yet!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const chaptersList = weakChapters.map(w => `${w[0]} (${w[1]} mistakes)`).join(', ');
      const prompt = `Based on my recent NEET practice, I have pending mistakes in the following chapters: ${chaptersList}. Can you analyze my weaknesses and provide a highly personalized, short 4-step study plan for today to improve? Keep it under 150 words and use Hinglish.`;
      
      const response = await mentorAPI.chat([{ sender: 'user', text: prompt }]);
      setAiPlan(response.text);
    } catch (error) {
      toast.error("Failed to connect to AI Mentor.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-float bg-blue-600"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-500 to-indigo-800 opacity-90" />
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
          
          {/* Decorative Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-400/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold mb-6">
                <Sparkles size={16} /> Daily Preparation
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Study Planner
              </h1>
              <p className="text-emerald-50 text-lg md:text-xl font-medium mb-8 max-w-lg leading-relaxed">
                A realistic day beats an impossible timetable. We use your mistake notebook to prioritize your daily revision loop.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={generateAIPlan} disabled={isGenerating} className="group flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100">
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                  {isGenerating ? 'AI Analyzing Weaknesses...' : 'Generate AI Plan'}
                </button>
              </div>
            </div>

            {/* Date Display */}
            <div className="shrink-0 relative w-48 h-48 flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
              <CalendarCheck2 size={32} className="text-white mb-2 opacity-80" />
              <div className="text-4xl font-black text-white tracking-tighter text-center px-4 leading-tight">
                {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
              </div>
              <div className="text-sm font-bold text-emerald-100 uppercase tracking-widest mt-2">
                {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI PLAN DISPLAY */}
        <AnimatePresence>
          {aiPlan && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-purple-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <BrainCircuit size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">Your AI-Generated Strategy</h2>
              </div>
              <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                {aiPlan}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STATIC LOOP PLANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 md:p-10 lg:col-span-2 rounded-[2rem]"
          >
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Four-step loop</p>
                <h2 className="text-3xl font-extrabold text-slate-800">Today's focused work</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Clock3 size={18} className="text-slate-500" />
                <span className="font-bold text-slate-700">2 hr 20 min total</span>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map(({ title, meta, icon: Icon, colorClass }, index) => (
                <div key={title} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all bg-white group cursor-pointer" onClick={() => index === 2 ? navigate('/mistakes') : navigate('/tests')}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorClass} transition-transform group-hover:scale-110`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step {index + 1}</div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-sm font-semibold text-slate-500">{meta}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* PRIORITY SIDEBAR */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-[2rem]"
            >
              <div className="mb-6">
                <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-2">Priority chapters</p>
                <h2 className="text-2xl font-extrabold text-slate-800">Revise these first</h2>
              </div>
              
              <div className="space-y-4">
                {weakChapters.length > 0 ? weakChapters.map(([chapter, count], index) => (
                  <div key={chapter} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight mb-0.5">{chapter}</h4>
                      <p className="text-xs font-semibold text-slate-500">{count} unresolved mistake{count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Target size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Complete a test to generate personal priorities.</p>
                  </div>
                )}
              </div>
            </motion.div>

            <button 
              onClick={() => navigate('/tests')}
              className="w-full group relative p-6 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4">
                  <Dumbbell size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Start focused practice</h3>
                <p className="text-sm font-medium text-slate-400 mb-6">Generate a test from the verified bank</p>
                <div className="flex items-center text-primary font-bold text-sm">
                  Go to Mock Tests <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </button>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
};

export default StudyPlanPage;
