import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bookmark,
  Clock,
  BookOpenCheck,
  Beaker,
  Dna,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { questionsAPI } from '../services/api';

const PAGE_SIZE = 12;

const QuestionCard = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Helper to format Assertion-Reason text if it matches
  const formatQuestionText = (text) => {
    if (!text) return null;
    
    // Clean up any double spaces, extra newlines, and trailing dashes
    let formattedText = text.trim();

    // Check if it's an Assertion-Reason question
    if (formattedText.toLowerCase().includes('assertion') || formattedText.toLowerCase().includes('reason')) {
      const parts = formattedText.split(/(Assertion\s*\(A\)|Reason\s*\(R\)|Assertion|Reason)/i);
      return (
        <div className="space-y-2 text-slate-800 font-medium">
          {parts.map((part, i) => {
            if (/assertion/i.test(part) || /reason/i.test(part)) {
              return <strong key={i} className="text-indigo-600 block mt-2">{part}:</strong>;
            }
            return <span key={i} className="block pl-2 border-l-2 border-slate-200">{part.trim()}</span>;
          })}
        </div>
      );
    }

    // Replace internal newlines with paragraph breaks to make it look clean
    return (
      <div className="space-y-1">
        {formattedText.split('\n').map((line, i) => (
          <p key={i} className="text-slate-700">{line.trim()}</p>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full group"
    >
      {/* Badge & Meta Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
            question.difficulty === 'hard' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
            question.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
            'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {question.difficulty ? question.difficulty.toUpperCase() : 'MEDIUM'}
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            {question.pyq?.isPYQ ? `PYQ ${question.sourceDetails?.year || ''}`.trim() : 'Practice'}
          </span>
        </div>
        <button className="text-slate-300 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-slate-50">
          <Bookmark size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Chapter Breadcrumb */}
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-2">{question.chapter}</span>
          
          {/* Question Text */}
          <div className="text-slate-800 font-medium leading-relaxed mb-6">
            {formatQuestionText(question.questionText)}
          </div>
        </div>

        {/* Options List - Always Visible */}
        {question.options && (
          <div className="space-y-2.5 mb-6">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const hasText = question.options[opt]?.text;
              if (!hasText) return null;

              const isCorrect = question.correctAnswer === opt;
              const optionBgClass = showAnswer
                ? isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                  : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50';

              const indicatorClass = showAnswer
                ? isCorrect
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-400'
                : 'bg-white text-slate-500 border border-slate-200 group-hover:border-slate-300';

              return (
                <div 
                  key={opt}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 ${optionBgClass}`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${indicatorClass}`}>
                    {opt}
                  </span>
                  <span className="text-sm font-medium leading-normal">{question.options[opt].text}</span>
                  {showAnswer && isCorrect && (
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider ml-auto shrink-0">
                      Correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation Drawer */}
        {showAnswer && question.explanation?.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl"
          >
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Explanation</p>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">{question.explanation.text}</p>
          </motion.div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" /> Est. 1m 30s
        </span>
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className={`text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            showAnswer 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 hover:shadow'
          }`}
        >
          {showAnswer ? 'Hide Solution' : 'Show Solution'}
          <ChevronRight size={15} className={`transition-transform duration-200 ${showAnswer ? 'rotate-90' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

const QuestionBankPage = () => {
  const [metadata, setMetadata] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    subject: '',
    chapter: '',
    difficulty: '',
    search: '',
    collection: '',
    page: 1,
  });

  useEffect(() => {
    const params = filters.collection ? { collection: filters.collection } : {};
    questionsAPI.getMetadata(params)
      .then((res) => setMetadata(res.data || []))
      .catch(() => {});
  }, [filters.collection]);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters, limit: PAGE_SIZE };
    Object.keys(params).forEach((key) => !params[key] && delete params[key]);
    
    questionsAPI.getQuestions(params)
      .then((res) => {
        setQuestions(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, [filters]);

  const chapters = useMemo(() => [...new Set(metadata.filter(r => !filters.subject || r._id.subject === filters.subject).map(r => r._id.chapter).filter(Boolean))], [metadata, filters.subject]);

  const updateFilter = (name, value) => {
    setFilters((curr) => ({
      ...curr,
      [name]: value,
      // Pagination must preserve the requested page. Previously, clicking
      // Next called this helper but immediately reset the page back to 1.
      ...(name === 'page' ? {} : { page: 1 }),
      ...(name === 'subject' ? { chapter: '' } : {})
    }));
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), pagination.pages);
    if (nextPage !== pagination.page) updateFilter('page', nextPage);
  };

  const setCollection = (collection) => {
    setFilters({ subject: '', chapter: '', difficulty: '', search: '', collection, page: 1 });
  };

  const clearFilters = () => setFilters((curr) => ({ subject: '', chapter: '', difficulty: '', search: '', collection: curr.collection, page: 1 }));

  return (
    <AppShell hideSearch>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col h-full relative">
        
        {/* Header & Sticky Filter Bar */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl pt-4 pb-4 border-b border-slate-200/60 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">{filters.collection === 'ncert-mania' ? 'NCERT Mania' : 'Question Bank'}</h1>
              <p className="text-slate-500 font-medium">
                {filters.collection === 'ncert-mania'
                  ? `Practice ${pagination.total}+ line-by-line NCERT Botany questions.`
                  : `Browse and practice ${pagination.total}+ verified NEET questions.`}
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search questions by keyword..." 
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button onClick={() => setCollection('')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!filters.collection ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Practice</button>
              <button onClick={() => setCollection('ncert-mania')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.collection === 'ncert-mania' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><BookOpenCheck size={16} /> NCERT Mania</button>
            </div>

            {/* Subject Chips */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => updateFilter('subject', '')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!filters.subject ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Subjects</button>
              <button onClick={() => updateFilter('subject', 'physics')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.subject === 'physics' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Zap size={16} /> Physics</button>
              <button onClick={() => updateFilter('subject', 'chemistry')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.subject === 'chemistry' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Beaker size={16} /> Chemistry</button>
              <button onClick={() => updateFilter('subject', 'biology')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.subject === 'biology' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Dna size={16} /> Biology</button>
            </div>

            <div className="h-6 w-[1px] bg-slate-300 mx-2 hidden md:block"></div>

            {/* Chapter Dropdown (Premium) */}
            <select 
              value={filters.chapter} 
              onChange={(e) => updateFilter('chapter', e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="">All Chapters</option>
              {chapters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Difficulty Chips */}
            <select 
              value={filters.difficulty} 
              onChange={(e) => updateFilter('difficulty', e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {(filters.subject || filters.chapter || filters.difficulty || filters.search) && (
              <button onClick={clearFilters} className="text-sm font-bold text-red-500 hover:text-red-700 ml-auto">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="glass-card p-6 h-64 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">No questions found</h2>
              <p className="text-slate-500 font-medium max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {questions.map((q, i) => (
                <QuestionCard key={q._id} question={q} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              aria-label="Previous page"
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, index) => {
              const first = Math.min(Math.max(1, pagination.page - 2), Math.max(1, pagination.pages - 4));
              const page = first + index;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === pagination.page ? 'page' : undefined}
                  className={`min-w-10 rounded-xl border px-3 py-2.5 font-bold transition-colors ${page === pagination.page ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {page}
                </button>
              );
            })}
            <span className="font-bold text-slate-700">Page {pagination.page} of {pagination.pages}</span>
            <button 
              disabled={pagination.page >= pagination.pages}
              onClick={() => goToPage(pagination.page + 1)}
              aria-label="Next page"
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default QuestionBankPage;
