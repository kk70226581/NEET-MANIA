import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock3, FlaskConical, History, Layers3, Target, Timer, Sparkles, AlertCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppShell from '../components/AppShell';
import { questionsAPI, testsAPI } from '../services/api';

const testTypes = [
  { value: 'chapter_test', title: 'Chapter test', note: 'Master one chapter', icon: BookOpen, accent: 'text-blue-500 bg-blue-100', border: 'border-blue-500' },
  { value: 'topic_test', title: 'Topic drill', note: 'Target one concept', icon: Layers3, accent: 'text-emerald-500 bg-emerald-100', border: 'border-emerald-500' },
  { value: 'subject_test', title: 'Subject test', note: 'Build subject stamina', icon: FlaskConical, accent: 'text-purple-500 bg-purple-100', border: 'border-purple-500' },
  { value: 'pyq_test', title: 'PYQ test', note: 'Practise real pattern', icon: History, accent: 'text-orange-500 bg-orange-100', border: 'border-orange-500' },
  { value: 'full_mock', title: 'Full mock', note: '180 Qs · 180 mins', icon: Target, accent: 'text-red-500 bg-red-100', border: 'border-red-500' },
];

const TestsPage = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState([]);
  const [config, setConfig] = useState({ testType: 'chapter_test', classLevel: '11', subject: 'biology', chapter: '', topic: '', difficulty: '', questionCount: 5 });
  const [creating, setCreating] = useState(false);
  const [mockMode, setMockMode] = useState('standard');
  const [customChapters, setCustomChapters] = useState({ physics: [], chemistry: [], biology: [] });
  const [sharedCode, setSharedCode] = useState('');
  const [createdTest, setCreatedTest] = useState(null);

  const handleJoinTest = async () => {
    if (!sharedCode.trim()) {
      return toast.error('Please enter a valid test code.');
    }
    const cleanCode = sharedCode.trim();
    try {
      const response = await testsAPI.getTest(cleanCode);
      if (response.success && response.data) {
        navigate(`/exam/${cleanCode}`);
      } else {
        toast.error('Test not found. Please verify the code.');
      }
    } catch (error) {
      toast.error(error.message || 'Could not find this test.');
    }
  };

  const daysToExam = Math.max(0, Math.ceil((new Date('2027-05-02') - new Date()) / 86400000));

  useEffect(() => {
    questionsAPI.getMetadata().then((response) => {
      const rows = response.data || [];
      setMetadata(rows);
      if (rows[0]?._id.subject) setConfig((current) => ({
        ...current,
        subject: rows[0]._id.subject,
        classLevel: rows[0]._id.classLevel || current.classLevel
      }));
    }).catch(() => {});
  }, []);

  const subjects = useMemo(() => [...new Set(metadata.map((row) => row._id.subject).filter(Boolean))], [metadata]);
  const chapters = useMemo(() => [...new Set(metadata.filter((row) => row._id.subject === config.subject && row._id.classLevel === config.classLevel).map((row) => row._id.chapter).filter(Boolean))], [metadata, config.subject, config.classLevel]);
  const topics = useMemo(() => [...new Set(metadata.filter((row) => row._id.subject === config.subject && row._id.classLevel === config.classLevel && (!config.chapter || row._id.chapter === config.chapter)).map((row) => row._id.topic).filter(Boolean))], [metadata, config.subject, config.classLevel, config.chapter]);
  
  const groupedChapters = useMemo(() => {
    const grouped = { physics: { '11': [], '12': [] }, chemistry: { '11': [], '12': [] }, biology: { '11': [], '12': [] } };
    metadata.forEach(row => {
      const sub = row._id.subject;
      const lvl = String(row._id.classLevel || '11');
      const ch = row._id.chapter;
      if (sub && ch) {
        const targetSub = ['botany', 'zoology'].includes(sub) ? 'biology' : sub;
        if (grouped[targetSub]) {
          if (!grouped[targetSub][lvl]) grouped[targetSub][lvl] = [];
          if (!grouped[targetSub][lvl].includes(ch)) grouped[targetSub][lvl].push(ch);
        }
      }
    });
    return grouped;
  }, [metadata]);

  const availableQuestionCount = useMemo(() => metadata
    .filter((row) => row._id.subject === config.subject
      && row._id.classLevel === config.classLevel
      && (!config.chapter || row._id.chapter === config.chapter)
      && (!config.difficulty || row._id.difficulty === config.difficulty))
    .reduce((total, row) => total + (row.count || 0), 0), [metadata, config.subject, config.classLevel, config.chapter, config.difficulty]);
  const questionOptions = useMemo(() => {
    const choices = ['chapter_test', 'topic_test'].includes(config.testType)
      ? [5, 10, 15, 30]
      : [15, 30, 45, 60, 90];
    return choices.filter((count) => !config.chapter || count <= availableQuestionCount);
  }, [config.testType, config.chapter, availableQuestionCount]);
  
  const update = (name, value) => {
    setConfig((current) => ({ 
      ...current, 
      [name]: value, 
      ...(name === 'testType' ? { questionCount: ['chapter_test', 'topic_test'].includes(value) ? 5 : 30 } : {}),
      ...(['classLevel', 'subject'].includes(name) ? { chapter: '', topic: '' } : {}),
      ...(name === 'chapter' ? { topic: '' } : {}) 
    }));
    if (['classLevel', 'subject'].includes(name)) {
      // Nothing needed for custom mock as it handles its own state
    }
  };

  const handleChapterToggle = (subject, ch) => {
    setCustomChapters((prev) => {
      const subjectChapters = prev[subject] || [];
      return {
        ...prev,
        [subject]: subjectChapters.includes(ch)
          ? subjectChapters.filter((item) => item !== ch)
          : [...subjectChapters, ch]
      };
    });
  };

  const generate = async (onlyCreate = false) => {
    if (['chapter_test', 'topic_test'].includes(config.testType) && !config.chapter) return toast.error('Choose a chapter first.');
    if (config.testType === 'topic_test' && !config.topic) return toast.error('Choose a topic first.');
    
    if (config.testType === 'full_mock' && mockMode === 'custom') {
      const hasChapters = Object.values(customChapters).some(list => list.length > 0);
      if (!hasChapters) return toast.error('Select at least one chapter for the custom mock test.');
    }
    
    setCreating(true);
    try {
      const payload = { ...config, questionCount: Number(config.questionCount) };
      if (config.testType === 'full_mock') {
        if (mockMode === 'standard') {
          delete payload.classLevel; delete payload.subject; delete payload.chapter; delete payload.topic; delete payload.difficulty; delete payload.questionCount;
        } else {
          payload.customChapters = customChapters;
          delete payload.classLevel; delete payload.subject; delete payload.chapter; delete payload.topic; delete payload.difficulty; delete payload.questionCount;
        }
      }
      const response = await testsAPI.generateTest(payload);
      
      if (onlyCreate) {
        const testDetails = await testsAPI.getTest(response.data.testId);
        setCreatedTest({
          id: response.data.testId,
          code: testDetails.data.testId
        });
        toast.success('Test generated! Code is ready.');
      } else {
        navigate(`/exam/${response.data.testId}`);
      }
    } catch (error) {
      toast.error(error.message || 'Could not generate this test.');
    } finally {
      setCreating(false);
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
                <Sparkles size={16} /> Daily Motivation: "Success is the sum of small efforts, repeated day in and day out."
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Mock Tests & Practice
              </h1>
              <p className="text-emerald-50 text-lg md:text-xl font-medium mb-8 max-w-lg leading-relaxed">
                Choose a focused drill or enter full exam mode. Every paper is generated from our verified NEET question bank.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/attempts')} className="group flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  <History size={20} />
                  View Past Attempts
                </button>
              </div>
            </div>

            {/* Countdown Ring */}
            <div className="shrink-0 relative w-48 h-48 flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
              <Timer size={32} className="text-white mb-2 opacity-80" />
              <div className="text-6xl font-black text-white tracking-tighter">{daysToExam}</div>
              <div className="text-sm font-bold text-emerald-100 uppercase tracking-widest mt-1">Days to NEET</div>
            </div>
          </div>
        </motion.div>

        {/* TEST TYPES CATALOGUE */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {testTypes.map(({ value, title, note, icon: Icon, accent, border }) => (
            <button 
              key={value} 
              onClick={() => update('testType', value)}
              className={`flex flex-col items-center justify-center text-center p-6 rounded-[2rem] transition-all duration-300 border-2 ${
                config.testType === value 
                  ? `${border} bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-105 z-10` 
                  : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-colors ${
                config.testType === value ? accent : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon size={28} />
              </div>
              <h3 className={`font-extrabold mb-1 ${config.testType === value ? 'text-slate-800' : 'text-slate-600'}`}>{title}</h3>
              <p className="text-xs text-slate-500 font-medium">{note}</p>
            </button>
          ))}
        </div>

        {/* JOIN TEST BY CODE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers3 size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-slate-800">Have a shared Test Code?</h3>
              <p className="text-slate-500 text-sm font-medium">Enter the code shared by your teacher or friend to take the exact same test.</p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input 
              type="text" 
              placeholder="e.g. TEST-xxxxx or MongoDB ID" 
              value={sharedCode}
              onChange={(e) => setSharedCode(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-slate-700 w-full sm:w-64"
            />
            <button 
              onClick={handleJoinTest}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              Join Test
            </button>
          </div>
        </motion.div>

        {/* PAPER CONFIGURATION BUILDER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-10 rounded-[2rem]"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Paper Configuration</p>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Build your test</h2>
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <AlertCircle size={16} /> Only available combinations from your question bank are shown.
              </span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-sm font-bold">
              <Clock3 size={24} className="text-primary" />
              <span className="text-lg">{config.testType === 'full_mock' ? '180 min' : 'Timed test'}</span>
            </div>
          </div>

          {config.testType === 'full_mock' ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  className={`flex flex-col p-6 rounded-2xl transition-all duration-300 border-2 text-left ${
                    mockMode === 'standard' ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-200 bg-white hover:border-primary/50'
                  }`}
                  onClick={() => setMockMode('standard')}
                >
                  <strong className="text-lg text-slate-800 mb-1">Standard Full Syllabus</strong>
                  <span className="text-slate-500 font-medium">45 Physics, 45 Chemistry, 90 Biology</span>
                </button>
                <button 
                  className={`flex flex-col p-6 rounded-2xl transition-all duration-300 border-2 text-left ${
                    mockMode === 'custom' ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-200 bg-white hover:border-primary/50'
                  }`}
                  onClick={() => setMockMode('custom')}
                >
                  <strong className="text-lg text-slate-800 mb-1">Custom Chapters Syllabus</strong>
                  <span className="text-slate-500 font-medium">180 questions from selected chapters</span>
                </button>
              </div>

              {mockMode === 'standard' ? (
                <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                    <Target size={32} />
                  </div>
                  <div>
                    <strong className="block text-xl text-indigo-900 mb-1">Full NEET Mock Pattern</strong>
                    <span className="text-indigo-700 font-medium">45 Physics · 45 Chemistry · 90 Biology · +4/−1 marking scheme</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                  <p className="text-sm font-medium text-slate-600 mb-2">Select chapters across subjects. If no chapters are selected for a subject, the full syllabus for that subject will be used.</p>
                  
                  {['physics', 'chemistry', 'biology'].map(sub => (
                    <div key={sub} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <strong className="text-lg capitalize text-slate-800">{sub}</strong>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-500">{customChapters[sub]?.length || 0} selected</span>
                      </div>
                      <div className="p-4">
                        {['11', '12'].map(lvl => (
                          <div key={lvl} className="mb-4 last:mb-0">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Class {lvl}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {(groupedChapters[sub]?.[lvl] || []).map((ch) => (
                                <label key={ch} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                                  <input 
                                    type="checkbox" 
                                    checked={customChapters[sub]?.includes(ch) || false} 
                                    onChange={() => handleChapterToggle(sub, ch)}
                                    className="mt-1 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                  />
                                  <span className="text-sm font-medium text-slate-700 leading-tight">{ch}</span>
                                </label>
                              ))}
                              {(!groupedChapters[sub]?.[lvl] || groupedChapters[sub]?.[lvl].length === 0) && <div className="text-slate-400 text-sm p-2">No chapters available</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Class</label>
                <select value={config.classLevel} onChange={(e) => update('classLevel', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm">
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Subject</label>
                <select value={config.subject} onChange={(e) => update('subject', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm capitalize">
                  {(subjects.length ? subjects : ['biology', 'physics', 'chemistry']).map((item) => <option value={item} key={item} className="capitalize">{item}</option>)}
                </select>
              </div>
              
              {['chapter_test', 'topic_test'].includes(config.testType) && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Chapter</label>
                  <select value={config.chapter} onChange={(e) => update('chapter', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm">
                    <option value="">Select chapter</option>
                    {chapters.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              )}
              
              {config.testType === 'topic_test' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Topic</label>
                  <select value={config.topic} onChange={(e) => update('topic', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm">
                    <option value="">Select topic</option>
                    {topics.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              )}
              
              {!['pyq_test'].includes(config.testType) && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Difficulty</label>
                  <select value={config.difficulty} onChange={(e) => update('difficulty', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm">
                    <option value="">Balanced mix</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Questions {config.chapter && <span className="font-medium text-slate-400">· {availableQuestionCount} approved available</span>}</label>
                <select value={config.questionCount} onChange={(e) => update('questionCount', e.target.value)} className="p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-slate-700 shadow-sm">
                  {questionOptions.map((count) => <option value={count} key={count}>{count} questions</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Questions are randomized and answers auto-save during the exam.
            </p>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
              <button 
                onClick={() => generate(true)}
                disabled={creating}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-indigo-600 text-indigo-700 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Create & Get Code
              </button>
              <button 
                onClick={() => generate(false)}
                disabled={creating}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {creating ? (
                  <>Preparing paper <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" /></>
                ) : (
                  <><Play size={20} className="fill-white" /> Start Exam</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
        {createdTest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-6 relative">
                <h2 className="text-2xl font-black">Test Created Successfully!</h2>
                <p className="text-indigo-100 text-sm mt-1">Your custom exam is ready. Share it with your students or friends.</p>
              </div>
              <div className="p-8 space-y-6">
                
                {/* Code Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Shareable Test Code</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-800 tracking-wider select-all">{createdTest.code}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(createdTest.code);
                        toast.success('Test Code copied!');
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-lg transition-colors border border-indigo-100 shadow-sm"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                {/* Direct Link Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Direct Exam Link</span>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-600 truncate select-all">{`${window.location.origin}/exam/${createdTest.code}`}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/exam/${createdTest.code}`);
                        toast.success('Direct link copied!');
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-lg transition-colors border border-indigo-100 shadow-sm shrink-0"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    className="flex-1 py-3.5 text-slate-700 hover:bg-slate-100 font-bold rounded-2xl border border-slate-200 transition-colors"
                    onClick={() => setCreatedTest(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-colors"
                    onClick={() => {
                      navigate(`/exam/${createdTest.id}`);
                    }}
                  >
                    Start Test Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TestsPage;
