import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, BookOpen, CheckCircle, HelpCircle, Eye } from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';

const NursingMistakesPage = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [activeMistake, setActiveMistake] = useState(null);

  const fetchMistakes = () => {
    const token = localStorage.getItem('token');
    let url = 'http://localhost:5000/api/nursing/practice/mistakes';
    if (filterCategory) {
      url += `?category=${filterCategory}`;
    }

    setLoading(true);
    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMistakes(res.data.data || []))
      .catch(err => console.error('Error fetching mistakes:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMistakes();
  }, [filterCategory]);

  const handleResolve = (mistakeId) => {
    const token = localStorage.getItem('token');
    axios.patch(`http://localhost:5000/api/nursing/practice/mistakes/${mistakeId}`, {
      status: 'resolved'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        toast.success('Mistake marked as resolved!');
        setActiveMistake(null);
        fetchMistakes();
      })
      .catch(err => console.error('Failed to update status:', err));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Spaced Repetition Mistake Notebook</h1>
            <p className="mt-1 text-sm text-slate-500">Revise questions you previously answered incorrectly.</p>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Mistakes</option>
            <option value="conceptual">Conceptual Mistakes</option>
            <option value="calculation">Calculation Mistakes</option>
            <option value="memory">Memory-based Mistakes</option>
            <option value="reading">Reading Mistakes</option>
            <option value="time_management">Time Pressure Mistakes</option>
            <option value="guessing">Guessing Mistakes</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : mistakes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            <BrainCircuit size={40} className="mx-auto mb-4" />
            <h3 className="font-bold text-slate-700">Your Mistake Notebook is empty!</h3>
            <p className="text-xs">Any question you answer incorrectly during mock tests or practice will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              {mistakes.map((m) => (
                <div
                  key={m._id}
                  onClick={() => setActiveMistake(m)}
                  className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:border-emerald-500 bg-white flex justify-between items-center ${activeMistake?._id === m._id ? 'border-emerald-500' : 'border-slate-200'}`}
                >
                  <div className="space-y-2">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">{m.mistakeCategory.replace('_', ' ')}</span>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{m.question?.questionText}</h4>
                    <p className="text-xs text-slate-400">Repeated: {m.timesRepeated} times • Status: {m.revisionStatus}</p>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-emerald-500 transition"><Eye size={18} /></button>
                </div>
              ))}
            </div>

            {/* Inspect Details Panel */}
            <div>
              {activeMistake ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 sticky top-6">
                  <span className="inline-block rounded bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-800">
                    {activeMistake.mistakeCategory.replace('_', ' ')}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-relaxed">{activeMistake.question?.questionText}</h4>

                  <div className="space-y-2 text-xs">
                    <p className="text-red-600 font-semibold">Your Answer: {activeMistake.selectedOption || 'Skipped'}</p>
                    <p className="text-emerald-600 font-semibold">Correct Answer: {activeMistake.correctOption}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-bold text-slate-800 text-xs">Explanation:</h5>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{activeMistake.question?.explanation?.text}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolve(activeMistake._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 text-xs shadow-md"
                    >
                      <CheckCircle size={14} /> Resolve Mistake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-400 sticky top-6">
                  <p className="text-xs">Select a mistake from the list to inspect detailed answer explanations.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NursingMistakesPage;
