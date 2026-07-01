import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Clock3, FileQuestion, FlaskConical, History, Layers3, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { questionsAPI, testsAPI } from '../services/api';

const testTypes = [
  { value: 'chapter_test', title: 'Chapter test', note: 'Master one chapter', icon: BookOpen, accent: 'cyan' },
  { value: 'topic_test', title: 'Topic drill', note: 'Target one concept', icon: Layers3, accent: 'green' },
  { value: 'subject_test', title: 'Subject test', note: 'Build subject stamina', icon: FlaskConical, accent: 'pink' },
  { value: 'pyq_test', title: 'PYQ test', note: 'Practise the real pattern', icon: History, accent: 'yellow' },
  { value: 'full_mock', title: 'Full mock', note: '180 questions · 180 minutes', icon: Target, accent: 'red' },
];

const TestsPage = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState([]);
  const [config, setConfig] = useState({ testType: 'chapter_test', subject: 'biology', chapter: '', topic: '', difficulty: '', questionCount: 30 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    questionsAPI.getMetadata().then((response) => {
      const rows = response.data || [];
      setMetadata(rows);
      if (rows[0]?._id.subject) setConfig((current) => ({ ...current, subject: rows[0]._id.subject }));
    }).catch(() => {});
  }, []);

  const subjects = useMemo(() => [...new Set(metadata.map((row) => row._id.subject).filter(Boolean))], [metadata]);
  const chapters = useMemo(() => [...new Set(metadata.filter((row) => row._id.subject === config.subject).map((row) => row._id.chapter).filter(Boolean))], [metadata, config.subject]);
  const topics = useMemo(() => [...new Set(metadata.filter((row) => row._id.subject === config.subject && (!config.chapter || row._id.chapter === config.chapter)).map((row) => row._id.topic).filter(Boolean))], [metadata, config.subject, config.chapter]);
  const update = (name, value) => setConfig((current) => ({ ...current, [name]: value, ...(name === 'subject' ? { chapter: '', topic: '' } : {}), ...(name === 'chapter' ? { topic: '' } : {}) }));

  const generate = async () => {
    if (['chapter_test', 'topic_test'].includes(config.testType) && !config.chapter) return toast.error('Choose a chapter first.');
    if (config.testType === 'topic_test' && !config.topic) return toast.error('Choose a topic first.');
    setCreating(true);
    try {
      const payload = { ...config, questionCount: Number(config.questionCount) };
      if (config.testType === 'full_mock') {
        delete payload.subject; delete payload.chapter; delete payload.topic; delete payload.difficulty; delete payload.questionCount;
      }
      const response = await testsAPI.generateTest(payload);
      navigate(`/exam/${response.data.testId}`);
    } catch (error) {
      toast.error(error.message || 'Could not generate this test.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell eyebrow="Exam practice" title="Tests">
      <section className="product-hero">
        <div><span className="product-badge"><FileQuestion size={15} /> NEET test centre</span><h2>Practise with a purpose. Perform under pressure.</h2><p>Choose a focused drill or enter full exam mode. Every paper is generated from the verified question bank.</p></div>
        <button className="hero-outline-button" onClick={() => navigate('/attempts')}>Past attempts <ArrowRight size={16} /></button>
      </section>

      <section className="test-catalogue">
        {testTypes.map(({ value, title, note, icon: Icon, accent }) => (
          <button className={`catalogue-card accent-${accent} ${config.testType === value ? 'is-active' : ''}`} key={value} onClick={() => update('testType', value)}>
            <span><Icon size={21} /></span><strong>{title}</strong><small>{note}</small>
          </button>
        ))}
      </section>

      <section className="chalk-card professional-builder">
        <div className="builder-heading"><div><p className="student-eyebrow">Paper configuration</p><h2>Build your test</h2><span>Only available combinations from your question bank are shown.</span></div><div><Clock3 size={20} /><strong>{config.testType === 'full_mock' ? '180 min' : 'Timed test'}</strong></div></div>
        {config.testType === 'full_mock' ? (
          <div className="mock-summary"><Target size={28} /><div><strong>Full NEET mock</strong><span>45 Physics · 45 Chemistry · 90 Biology · +4/−1 marking</span></div></div>
        ) : (
          <div className="professional-fields">
            <label><span>Subject</span><select value={config.subject} onChange={(event) => update('subject', event.target.value)}>{(subjects.length ? subjects : ['biology', 'physics', 'chemistry']).map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            {['chapter_test', 'topic_test'].includes(config.testType) && <label><span>Chapter</span><select value={config.chapter} onChange={(event) => update('chapter', event.target.value)}><option value="">Select chapter</option>{chapters.map((item) => <option key={item}>{item}</option>)}</select></label>}
            {config.testType === 'topic_test' && <label><span>Topic</span><select value={config.topic} onChange={(event) => update('topic', event.target.value)}><option value="">Select topic</option>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>}
            {!['pyq_test'].includes(config.testType) && <label><span>Difficulty</span><select value={config.difficulty} onChange={(event) => update('difficulty', event.target.value)}><option value="">Balanced mix</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>}
            <label><span>Questions</span><select value={config.questionCount} onChange={(event) => update('questionCount', event.target.value)}><option value="15">15 questions</option><option value="30">30 questions</option><option value="45">45 questions</option><option value="60">60 questions</option><option value="90">90 questions</option></select></label>
          </div>
        )}
        <div className="builder-launch"><p>Questions are randomized and answers auto-save during the exam.</p><button onClick={generate} disabled={creating}>{creating ? 'Preparing paper…' : 'Start test'} <ArrowRight size={17} /></button></div>
      </section>
    </AppShell>
  );
};

export default TestsPage;
