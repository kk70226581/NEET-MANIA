import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Target, 
  XCircle,
  BrainCircuit,
  MessageSquare,
  AlertOctagon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { mistakesAPI } from '../services/api';

const MistakeCard = ({ mistake, index, onMarkRevised }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card overflow-hidden flex flex-col md:flex-row mb-6"
    >
      {/* Left Column: Mistake details */}
      <div className="flex-1 p-6 md:p-8 md:border-r border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
              #{index + 1}
            </span>
            <div>
              <h3 className="font-bold text-slate-800">{mistake.questionDetails?.chapter}</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{mistake.questionDetails?.subject} • {mistake.priority}</p>
            </div>
          </div>
          {mistake.revisionStatus === 'completed' && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
              <CheckCircle2 size={14} /> Revised
            </span>
          )}
        </div>

        <p className="text-lg font-medium text-slate-800 leading-relaxed mb-6 whitespace-pre-wrap">
          {mistake.questionDetails?.questionText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <XCircle size={40} className="text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Your Answer</p>
            <p className="font-semibold text-red-900">{mistake.studentResponse?.selectedOption || 'Skipped'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Correct Answer</p>
            <p className="font-semibold text-emerald-900">{mistake.correctAnswer?.option}</p>
          </div>
        </div>
      </div>

      {/* Right Column: AI Analysis & Actions */}
      <div className="w-full md:w-80 bg-slate-50 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-4">
            <BrainCircuit size={20} /> AI Explanation
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {mistake.correctAnswer?.explanation || "This is a factual concept from NCERT. The AI mentor suggests reviewing the core paragraph in your textbook, as this question type frequently repeats."}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('askAIToExplain', { 
                detail: { question: `Please explain this question and why the correct answer is "${mistake.correctAnswer?.option}". Question: "${mistake.questionDetails?.questionText}"` } 
              }));
            }}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> Ask AI Mentor
          </button>
          
          {mistake.revisionStatus !== 'completed' && (
            <button 
              onClick={() => onMarkRevised(mistake._id)}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Target size={18} /> Mark as Revised
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MistakesPage = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');

  const load = React.useCallback(() => {
    setLoading(true);
    mistakesAPI.getMistakes({ status: status === 'all' ? undefined : status })
      .then((res) => setMistakes(res.data || []))
      .catch(() => toast.error('Failed to load notebook'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const markRevised = async (id) => {
    try {
      await mistakesAPI.updateMistake(id, { revisionStatus: 'completed' });
      setMistakes((curr) => curr.filter((m) => m._id !== id));
      toast.success('Mistake revised successfully!');
    } catch (error) {
      toast.error('Could not update mistake.');
    }
  };

  return (
    <AppShell hideSearch>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-4">
              <AlertOctagon size={16} /> Priority Revision Area
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Mistake Notebook</h1>
            <p className="text-slate-500 font-medium text-lg">Fix the pattern. Never repeat the same mistake twice.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            {['pending', 'completed', 'all'].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${status === item ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="glass-card h-80 animate-pulse bg-slate-100"></div>
            ))}
          </div>
        ) : mistakes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">You're all caught up!</h2>
            <p className="text-slate-500 font-medium text-lg max-w-md">
              There are no {status === 'pending' ? 'pending' : ''} mistakes to review. Keep taking mock tests to generate more personalized revision material.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {mistakes.map((mistake, i) => (
                <MistakeCard key={mistake._id} mistake={mistake} index={i} onMarkRevised={markRevised} />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default MistakesPage;
