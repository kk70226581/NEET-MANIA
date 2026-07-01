import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { questionsAPI } from '../services/api';

const PAGE_SIZE = 12;

const labelize = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const difficultyClass = (difficulty) => {
  const key = String(difficulty || '').toLowerCase();
  if (key === 'easy') return 'is-easy';
  if (key === 'hard') return 'is-hard';
  return 'is-medium';
};

const QuestionBankPage = () => {
  const [metadata, setMetadata] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    subject: '',
    chapter: '',
    difficulty: '',
    source: '',
    search: '',
    page: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionsAPI.getMetadata()
      .then((response) => setMetadata(response.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters, limit: PAGE_SIZE };
    Object.keys(params).forEach((key) => !params[key] && delete params[key]);
    questionsAPI.getQuestions(params)
      .then((response) => {
        setQuestions(response.data || []);
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch((error) => toast.error(error.message || 'Could not load the question bank.'))
      .finally(() => setLoading(false));
  }, [filters]);

  const subjects = useMemo(
    () => [...new Set(metadata.map((row) => row._id.subject).filter(Boolean))],
    [metadata]
  );

  const chapters = useMemo(
    () => [
      ...new Set(
        metadata
          .filter((row) => !filters.subject || row._id.subject === filters.subject)
          .map((row) => row._id.chapter)
          .filter(Boolean)
      ),
    ],
    [metadata, filters.subject]
  );

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
      ...(name === 'subject' ? { chapter: '' } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({ subject: '', chapter: '', difficulty: '', source: '', search: '', page: 1 });
  };

  const hasFilters = Boolean(
    filters.subject || filters.chapter || filters.difficulty || filters.source || filters.search.trim()
  );

  return (
    <AppShell eyebrow="Explore and practise" title="Question bank" hideSearch>
      <section className="bank-studio">
        <header className="bank-studio-head">
          <div>
            <span>Verified NEET library</span>
            <h2>Question bank</h2>
          </div>
          <label className="bank-search">
            <Search size={17} />
            <input
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search chapters, topics, questions"
            />
            {filters.search && (
              <button type="button" onClick={() => updateFilter('search', '')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
        </header>

        {subjects.length > 0 && (
          <nav className="bank-subject-tabs" aria-label="Question bank subjects">
            <button
              type="button"
              className={!filters.subject ? 'is-active' : ''}
              onClick={() => updateFilter('subject', '')}
            >
              All subjects
            </button>
            {subjects.map((subject) => (
              <button
                type="button"
                key={subject}
                className={filters.subject === subject ? 'is-active' : ''}
                onClick={() => updateFilter('subject', subject)}
              >
                {labelize(subject)}
              </button>
            ))}
          </nav>
        )}

        <div className="bank-studio-layout">
          <aside className="bank-filter-card">
            <div className="bank-filter-title">
              <SlidersHorizontal size={19} />
              <h3>Filters</h3>
            </div>

            <label>
              <span>Subject</span>
              <select value={filters.subject} onChange={(event) => updateFilter('subject', event.target.value)}>
                <option value="">All subjects</option>
                {subjects.map((item) => <option value={item} key={item}>{labelize(item)}</option>)}
              </select>
            </label>

            <label>
              <span>Chapter</span>
              <select value={filters.chapter} onChange={(event) => updateFilter('chapter', event.target.value)}>
                <option value="">All chapters</option>
                {chapters.map((item) => <option value={item} key={item}>{labelize(item)}</option>)}
              </select>
            </label>

            <label>
              <span>Difficulty</span>
              <select value={filters.difficulty} onChange={(event) => updateFilter('difficulty', event.target.value)}>
                <option value="">All levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>

            <label>
              <span>Source</span>
              <select value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
                <option value="">All sources</option>
                <option value="pyq">Previous year</option>
                <option value="ncert">NCERT</option>
                <option value="mock">Mock</option>
                <option value="custom">Original</option>
              </select>
            </label>

            <button type="button" onClick={clearFilters} disabled={!hasFilters}>
              <Filter size={15} /> Clear filters
            </button>
          </aside>

          <div className="bank-results">
            <div className="bank-toolbar">
              <div>
                <Search size={16} />
                <span>{pagination.total.toLocaleString()} questions match</span>
              </div>
              <p>Page {pagination.page} of {Math.max(1, pagination.pages)}</p>
            </div>

            {loading ? (
              <div className="chalk-card workspace-loading">
                <div className="loader" />
                <span>Loading questions...</span>
              </div>
            ) : (
              <div className="question-browser-grid">
                {questions.map((question, index) => (
                  <article className="browser-question" key={question._id}>
                    <div className="browser-question-top">
                      <span>Q{String((pagination.page - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}</span>
                      <div>
                        <em>{labelize(question.subject)}</em>
                        <em className={difficultyClass(question.difficulty)}>{labelize(question.difficulty)}</em>
                      </div>
                    </div>
                    <h3>{question.questionText}</h3>
                    <p>
                      {labelize(question.chapter)}
                      {question.topic ? <><span>/</span>{labelize(question.topic)}</> : null}
                    </p>
                    <div className="browser-tags">
                      <span>{labelize(question.source) || 'Question'}</span>
                      <span>{labelize(question.type) || 'MCQ'}</span>
                      {question.image?.url && <span>Diagram</span>}
                      <button type="button">
                        Practice <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </article>
                ))}
                {!questions.length && (
                  <div className="chalk-card workspace-empty">
                    <div><Search size={28} /></div>
                    <h2>No matching questions</h2>
                    <p>Try a broader chapter, difficulty, or search term.</p>
                    <button type="button" className="report-primary-button" onClick={clearFilters}>Clear filters</button>
                  </div>
                )}
              </div>
            )}

            <div className="page-controls">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default QuestionBankPage;
