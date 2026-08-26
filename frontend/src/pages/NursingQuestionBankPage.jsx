import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { nursingAPI } from '../services/api';

const sourceLabel = (question) => {
  if (question.sourceType === 'official' && question.isPYQ) return 'Official previous year';
  if (question.generatedByAI) return 'AI practice';
  if (question.sourceType === 'admin-created') return 'Practice';
  return question.sourceType || 'Practice';
};

const NursingQuestionBankPage = ({ view = 'bank' }) => {
  const [catalog, setCatalog] = useState({ exams: [], subjects: [], chapters: [], topics: [] });
  const [filters, setFilters] = useState({ search: '', subject: '', chapter: '', topic: '', difficulty: '', exam: '', year: '', sort: 'newest', page: 1 });
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const chapters = useMemo(() => catalog.chapters.filter(chapter => !filters.subject || String(chapter.subjectId) === filters.subject), [catalog.chapters, filters.subject]);
  const topics = useMemo(() => catalog.topics.filter(topic => !filters.chapter || String(topic.chapterId) === filters.chapter), [catalog.topics, filters.chapter]);

  useEffect(() => { nursingAPI.getCatalog().then(response => setCatalog(response.data)).catch(() => toast.error('Could not load the syllabus.')); }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = view === 'bookmarks'
      ? nursingAPI.getBookmarks().then(response => ({ data: (response.data || []).map(item => ({ ...item.question, bookmarked: true })), pagination: { page: 1, pages: 1, total: response.count || 0 } }))
      : nursingAPI.getQuestions({ ...filters, previousYear: view === 'previous-year' ? 'true' : undefined, limit: 12 });
    load.then(response => {
      if (!active) return;
      let data = response.data || [];
      if (view === 'bookmarks') {
        if (filters.subject) data = data.filter(item => String(item.subject?._id || item.subject) === filters.subject);
        if (filters.chapter) data = data.filter(item => String(item.chapter?._id || item.chapter) === filters.chapter);
        if (filters.difficulty) data = data.filter(item => item.difficulty === filters.difficulty);
        if (filters.search) data = data.filter(item => item.questionText.toLowerCase().includes(filters.search.toLowerCase()));
      }
      setQuestions(data);
      setPagination(response.pagination || { page: 1, pages: 1, total: data.length });
    }).catch(error => toast.error(error.message || 'Could not load questions.')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filters, view]);

  const setFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, page: key === 'page' ? value : 1, ...(key === 'subject' ? { chapter: '', topic: '' } : {}), ...(key === 'chapter' ? { topic: '' } : {}) }));

  const submitAnswer = async (question) => {
    const selectedAnswer = answers[question._id]?.selected;
    if (!selectedAnswer) return toast.error('Choose an option first.');
    try {
      const response = await nursingAPI.answerQuestion(question._id, { selectedAnswer });
      setAnswers(current => ({ ...current, [question._id]: { ...current[question._id], result: response.data } }));
    } catch (error) { toast.error(error.message || 'Could not check the answer.'); }
  };

  const toggleBookmark = async (question) => {
    try {
      const response = await nursingAPI.toggleBookmark(question._id);
      if (view === 'bookmarks' && !response.bookmarked) setQuestions(items => items.filter(item => item._id !== question._id));
      else setQuestions(items => items.map(item => item._id === question._id ? { ...item, bookmarked: response.bookmarked } : item));
      toast.success(response.message);
    } catch (error) { toast.error(error.message || 'Could not update bookmark.'); }
  };

  const title = view === 'bookmarks' ? 'Bookmarked questions' : view === 'previous-year' ? 'Verified previous-year questions' : 'BSc Nursing question bank';

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600">Practice library</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{view === 'previous-year' ? 'Only questions with verified reuse permission appear here.' : 'Search and practice without loading the whole bank into your browser.'}</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
            <label className="relative md:col-span-2 xl:col-span-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={17} />
              <input value={filters.search} onChange={event => setFilter('search', event.target.value)} placeholder="Search question, concept, tag…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm" />
            </label>
            <select value={filters.exam} onChange={event => setFilter('exam', event.target.value)} className="rounded-xl border border-slate-200 px-3 text-sm"><option value="">All exams</option>{catalog.exams.map(item => <option value={item._id} key={item._id}>{item.examName}</option>)}</select>
            <select value={filters.subject} onChange={event => setFilter('subject', event.target.value)} className="rounded-xl border border-slate-200 px-3 text-sm"><option value="">All subjects</option>{catalog.subjects.map(item => <option value={item._id} key={item._id}>{item.name}</option>)}</select>
            <select value={filters.chapter} onChange={event => setFilter('chapter', event.target.value)} className="rounded-xl border border-slate-200 px-3 text-sm"><option value="">All chapters</option>{chapters.map(item => <option value={item._id} key={item._id}>{item.fullChapterName}</option>)}</select>
            <select value={filters.topic} onChange={event => setFilter('topic', event.target.value)} className="rounded-xl border border-slate-200 px-3 text-sm"><option value="">All topics</option>{topics.map(item => <option value={item._id} key={item._id}>{item.name}</option>)}</select>
            <select value={filters.difficulty} onChange={event => setFilter('difficulty', event.target.value)} className="rounded-xl border border-slate-200 px-3 text-sm"><option value="">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><SlidersHorizontal size={14} /> {pagination.total} matching questions</div>
        </section>

        {loading ? <div className="py-24 text-center text-slate-500">Loading question bank…</div> : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">No published questions match these filters.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => {
              const state = answers[question._id] || {};
              return (
                <article key={question._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{sourceLabel(question)}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{question.difficulty}</span>
                    <span className="text-slate-400">{question.subject?.name} · {question.chapter?.fullChapterName}</span>
                    <button onClick={() => toggleBookmark(question)} className={`ml-auto rounded-lg p-2 ${question.bookmarked ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`} aria-label="Toggle bookmark"><Bookmark size={17} fill={question.bookmarked ? 'currentColor' : 'none'} /></button>
                  </div>
                  <h2 className="mt-4 text-base font-bold leading-7 text-slate-900">{(filters.page - 1) * 12 + index + 1}. {question.questionText}</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {Object.entries(question.options || {}).map(([key, option]) => {
                      const result = state.result;
                      const correct = result?.correctAnswer === key;
                      const wrong = result && state.selected === key && !result.isCorrect;
                      return <button key={key} disabled={Boolean(result)} onClick={() => setAnswers(current => ({ ...current, [question._id]: { selected: key } }))} className={`rounded-xl border p-3 text-left text-sm transition ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : wrong ? 'border-rose-400 bg-rose-50 text-rose-900' : state.selected === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-400'}`}><b className="mr-2">{key}.</b>{option.text}</button>;
                    })}
                  </div>
                  {!state.result ? <button onClick={() => submitAnswer(question)} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Check answer</button> : (
                    <div className={`mt-4 rounded-xl p-4 text-sm ${state.result.isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}><strong>{state.result.isCorrect ? 'Correct' : `Correct answer: ${state.result.correctAnswer}`}</strong><p className="mt-2 leading-6">{state.result.explanation?.text || 'Explanation is awaiting review.'}</p></div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {view !== 'bookmarks' && pagination.pages > 1 && <div className="flex items-center justify-center gap-4"><button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)} className="rounded-xl border bg-white p-2 disabled:opacity-40"><ChevronLeft /></button><span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages}</span><button disabled={filters.page >= pagination.pages} onClick={() => setFilter('page', filters.page + 1)} className="rounded-xl border bg-white p-2 disabled:opacity-40"><ChevronRight /></button></div>}
      </div>
    </AppShell>
  );
};

export default NursingQuestionBankPage;
