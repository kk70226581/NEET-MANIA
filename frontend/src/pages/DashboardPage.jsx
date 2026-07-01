import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  History,
  Play,
  Sparkles,
  Target,
  Layers3,
  BarChart3,
  CalendarCheck2,
  BookMarked,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { questionsAPI, testsAPI } from '../services/api';

const testTypes = [
  { value: 'full_mock', label: 'Full mock', detail: 'A complete NEET-style paper', icon: Target },
  { value: 'subject_test', label: 'Subject test', detail: 'Focused practice for one subject', icon: FlaskConical },
  { value: 'chapter_test', label: 'Chapter test', detail: 'Sharpen one chapter at a time', icon: BookOpen },
  { value: 'topic_test', label: 'Topic test', detail: 'Drill one concept with precision', icon: Layers3 },
  { value: 'pyq_test', label: 'PYQ sprint', detail: 'Previous-year question practice', icon: History },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [testType, setTestType] = useState('full_mock');
  const [subject, setSubject] = useState('biology');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [metadata, setMetadata] = useState([]);
  const [questionCount, setQuestionCount] = useState(45);
  const [creating, setCreating] = useState(false);

  const daysToExam = useMemo(() => {
    const target = new Date('2027-05-02T00:00:00');
    return Math.max(0, Math.ceil((target - new Date()) / 86400000));
  }, []);

  const selectedType = testTypes.find((item) => item.value === testType);
  const availableSubjects = useMemo(
    () => [...new Set(metadata.map((row) => row._id.subject).filter(Boolean))],
    [metadata]
  );
  const availableChapters = useMemo(
    () => [...new Set(metadata.filter((row) => row._id.subject === subject).map((row) => row._id.chapter).filter(Boolean))],
    [metadata, subject]
  );
  const availableTopics = useMemo(
    () => [...new Set(metadata.filter((row) => row._id.subject === subject && (!chapter || row._id.chapter === chapter)).map((row) => row._id.topic).filter(Boolean))],
    [metadata, subject, chapter]
  );

  useEffect(() => {
    questionsAPI.getMetadata()
      .then((response) => {
        const rows = response.data || [];
        setMetadata(rows);
        const firstSubject = rows[0]?._id?.subject;
        if (firstSubject) setSubject(firstSubject);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setChapter('');
    setTopic('');
  }, [subject]);

  useEffect(() => {
    setTopic('');
  }, [chapter]);

  const createTest = async () => {
    if (testType === 'chapter_test' && !chapter.trim()) {
      toast.error('Choose a chapter for a chapter test.');
      return;
    }
    if (testType === 'topic_test' && !topic) {
      toast.error('Choose a topic for a topic test.');
      return;
    }

    setCreating(true);
    try {
      const response = await testsAPI.generateTest({
        testType,
        subject: testType === 'full_mock' ? undefined : subject,
        chapter: ['chapter_test', 'topic_test'].includes(testType) ? chapter : undefined,
        topic: testType === 'topic_test' ? topic : undefined,
        questionCount: Number(questionCount),
        difficulty: difficulty || undefined,
      });
      toast.success('Your test is ready.');
      navigate(`/exam/${response.data.testId}`);
    } catch (error) {
      toast.error(error.message || 'Could not generate a test. Add published questions and try again.');
    } finally {
      setCreating(false);
    }
  };

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell
      eyebrow="Student workspace"
      title={`${greeting}, ${user?.firstName || 'aspirant'}`}
      actions={
        <button className="shell-action-button" onClick={() => navigate('/attempts')}>
          <History size={16} />
          View attempts
        </button>
      }
    >
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-kicker"><Sparkles size={15} /> Today’s study desk</span>
          <h2>Turn the next hour into a measurable win.</h2>
          <p>Build a focused test, solve it in exam mode, then use your report to decide what deserves revision next.</p>
        </div>
        <div className="exam-countdown">
          <CalendarDays size={22} />
          <strong>{daysToExam}</strong>
          <span>days to NEET 2027</span>
        </div>
      </section>

      <section className="dashboard-portals">
        {[
          ['/question-bank', 'Question bank', 'Browse verified questions', BookOpen, 'cyan'],
          ['/tests', 'Test centre', 'Chapter, subject and mocks', Target, 'yellow'],
          ['/performance', 'Performance', 'Scores, accuracy and trends', BarChart3, 'green'],
          ['/study-plan', 'Study plan', 'Your focused work for today', CalendarCheck2, 'pink'],
          ['/mistakes', 'Mistake notebook', 'Revise every wrong answer', BookMarked, 'red'],
        ].map(([to, label, note, Icon, tone]) => (
          <button className={`dashboard-portal tone-${tone}`} onClick={() => navigate(to)} key={to}>
            <span><Icon size={19} /></span><div><strong>{label}</strong><small>{note}</small></div><ArrowRight size={16} />
          </button>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="chalk-card test-builder">
          <div className="section-heading">
            <div>
              <p className="student-eyebrow">Quick test builder</p>
              <h2>What are we practising?</h2>
            </div>
            <div className="section-icon"><Play size={20} /></div>
          </div>

          <div className="test-type-grid">
            {testTypes.map(({ value, label, detail, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`test-type-card ${testType === value ? 'is-selected' : ''}`}
                onClick={() => setTestType(value)}
              >
                <Icon size={20} />
                <strong>{label}</strong>
                <span>{detail}</span>
                {testType === value && <CheckCircle2 className="type-check" size={17} />}
              </button>
            ))}
          </div>

          <div className="builder-fields">
            {testType !== 'full_mock' && (
              <label>
                <span>Subject</span>
                <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                  {(availableSubjects.length ? availableSubjects : ['biology', 'physics', 'chemistry']).map((name) => (
                    <option value={name} key={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
                  ))}
                </select>
              </label>
            )}
            {['chapter_test', 'topic_test'].includes(testType) && (
              <label>
                <span>Chapter</span>
                <select value={chapter} onChange={(event) => setChapter(event.target.value)}>
                  <option value="">Choose chapter</option>
                  {availableChapters.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
            )}
            {testType === 'topic_test' && (
              <label>
                <span>Topic</span>
                <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                  <option value="">Choose topic</option>
                  {availableTopics.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
            )}
            {testType !== 'full_mock' && (
              <label>
                <span>Questions</span>
                <select value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}>
                  <option value="15">15 questions</option>
                  <option value="30">30 questions</option>
                  <option value="45">45 questions</option>
                  <option value="90">90 questions</option>
                </select>
              </label>
            )}
            {!['full_mock', 'pyq_test'].includes(testType) && (
              <label>
                <span>Difficulty</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                  <option value="">Balanced mix</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            )}
          </div>

          <div className="builder-summary">
            <div>
              <Clock3 size={18} />
              <span><strong>{selectedType.label}</strong><small>{selectedType.detail}</small></span>
            </div>
            <button onClick={createTest} disabled={creating}>
              {creating ? 'Building test…' : 'Generate test'}
              {!creating && <ArrowRight size={17} />}
            </button>
          </div>
        </div>

        <aside className="dashboard-side">
          <div className="chalk-card focus-card">
            <p className="student-eyebrow">Simple rhythm</p>
            <h2>Practice loop</h2>
            {[
              ['01', 'Choose a narrow goal'],
              ['02', 'Solve without interruptions'],
              ['03', 'Review every wrong answer'],
            ].map(([number, label]) => (
              <div className="focus-step" key={number}>
                <span>{number}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <button className="attempts-cta" onClick={() => navigate('/attempts')}>
            <History size={22} />
            <span><strong>Past attempts</strong><small>Open scores and reports</small></span>
            <ArrowRight size={18} />
          </button>
        </aside>
      </section>
    </AppShell>
  );
};

export default DashboardPage;
