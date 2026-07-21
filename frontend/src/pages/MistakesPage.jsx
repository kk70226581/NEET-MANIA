import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Target, 
  XCircle,
  BrainCircuit,
  MessageSquare,
  AlertOctagon,
  AlertTriangle,
  HelpCircle,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { mistakesAPI } from '../services/api';

const MistakeCard = ({ mistake, index, onMarkRevised }) => {
  const isSkipped = mistake.studentResponse?.isSkipped || !mistake.studentResponse?.selectedOption;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card overflow-hidden flex flex-col md:flex-row mb-6 border border-slate-100 hover:border-slate-200 transition-all shadow-sm"
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {mistake.questionDetails?.subject} • {mistake.priority}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSkipped ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                <HelpCircle size={12} /> Skipped
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                <XCircle size={12} /> Incorrect
              </span>
            )}
            {mistake.revisionStatus === 'completed' && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                <CheckCircle2 size={12} /> Revised
              </span>
            )}
          </div>
        </div>

        <p className="text-lg font-medium text-slate-800 leading-relaxed mb-6 whitespace-pre-wrap">
          {mistake.questionDetails?.questionText?.replace(/\[[a-f0-9]{8}\]$/i, '').trim()}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
          {isSkipped ? (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <HelpCircle size={40} className="text-amber-500" />
              </div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Your Response</p>
              <p className="font-semibold text-amber-900">Skipped (Not Attempted)</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <XCircle size={40} className="text-rose-500" />
              </div>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Your Answer</p>
              <p className="font-semibold text-rose-900">Option {mistake.studentResponse?.selectedOption}</p>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Correct Answer</p>
            <p className="font-semibold text-emerald-900">Option {mistake.correctAnswer?.option}</p>
          </div>
        </div>
      </div>

      {/* Right Column: AI Analysis & Actions */}
      <div className="w-full md:w-80 bg-slate-50/60 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
            <BrainCircuit size={20} /> AI Mentor Analysis
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {mistake.correctAnswer?.explanation || "This is a core concept from NCERT. The AI mentor suggests reviewing this chapter carefully to solidify your knowledge patterns before re-attempting."}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('askAIToExplain', { 
                detail: { question: `Please explain this question and why the correct answer is "${mistake.correctAnswer?.option}". Question: "${mistake.questionDetails?.questionText?.replace(/\[[a-f0-9]{8}\]$/i, '').trim()}"` } 
              }));
            }}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> Ask AI Mentor
          </button>
          
          {mistake.revisionStatus !== 'completed' && (
            <button 
              onClick={() => onMarkRevised(mistake._id)}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
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
  const [filterType, setFilterType] = useState('all'); // 'all', 'incorrect', 'skipped'

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

  // Filter mistakes client side based on 'incorrect' vs 'skipped'
  const filteredMistakes = mistakes.filter((mistake) => {
    const isSkipped = mistake.studentResponse?.isSkipped || !mistake.studentResponse?.selectedOption;
    if (filterType === 'incorrect') return !isSkipped;
    if (filterType === 'skipped') return isSkipped;
    return true;
  });

  return (
    <AppShell hideSearch>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-4">
                <AlertOctagon size={16} /> Priority Revision Area
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Mistake Notebook</h1>
              <p className="text-slate-500 font-medium text-lg">Fix the pattern. Never repeat the same mistake twice.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto self-stretch md:self-auto">
              {['pending', 'completed', 'all'].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${status === item ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {item === 'completed' ? 'Revised' : item}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Filters for Mistake Types */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-6">
            {[
              { id: 'all', label: 'All Mistakes' },
              { id: 'incorrect', label: 'Incorrect Answers' },
              { id: 'skipped', label: 'Skipped Questions' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  filterType === type.id
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.label}
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
        ) : filteredMistakes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Inbox size={40} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">No questions found</h2>
            <p className="text-slate-500 font-medium max-w-md">
              There are no {status === 'pending' ? 'pending' : status === 'completed' ? 'revised' : ''} {filterType === 'incorrect' ? 'incorrect answers' : filterType === 'skipped' ? 'skipped questions' : 'mistakes'} to show.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredMistakes.map((mistake, i) => (
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
