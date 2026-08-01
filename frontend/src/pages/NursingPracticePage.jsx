import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  BookOpen,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';

const NursingPracticePage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [practiceActive, setPracticeActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/nursing/syllabus/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSubjects(res.data.subjects || []))
      .catch(err => console.error('Error fetching subjects:', err));
  }, []);

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setSelectedChapter(null);
    setChapters([]);

    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/nursing/syllabus/chapters?subjectSlug=${sub.subjectSlug}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setChapters(res.data.chapters || []))
      .catch(err => console.error('Error fetching chapters:', err));
  };

  const handleStartPractice = (chap) => {
    setSelectedChapter(chap);
    const token = localStorage.getItem('token');

    axios.get(`http://localhost:5000/api/nursing/practice/chapter/${chap._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const qList = res.data.data || [];
        if (qList.length === 0) {
          toast.error('No questions available in this chapter yet.');
          return;
        }
        setQuestions(qList);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setPracticeActive(true);
      })
      .catch(err => {
        console.error('Error loading questions:', err);
        toast.error('Failed to load chapter questions.');
      });
  };

  const handleOptionSelect = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return;
    setIsAnswered(true);

    const token = localStorage.getItem('token');
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    // Send mistake to notebook if wrong
    if (!isCorrect) {
      axios.post('http://localhost:5000/api/nursing/practice/mistakes', {
        questionId: currentQ._id,
        selectedOption,
        correctOption: currentQ.correctAnswer,
        mistakeCategory: 'conceptual'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Mistake logging failed:', err));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success('Chapter Practice Session Completed!');
      setPracticeActive(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {!practiceActive ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">Chapter-wise Practice & Mastery</h1>
              <p className="mt-1 text-sm text-slate-500">Select a subject and chapter to start practicing seeded questions immediately.</p>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {subjects.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => handleSubjectSelect(sub)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-4 shadow-sm transition hover:border-emerald-500 hover:shadow-md ${selectedSubject?._id === sub._id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  <BookOpen size={24} className="mb-2" />
                  <span className="text-xs font-bold">{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Chapters list */}
            {selectedSubject && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-slate-800">Chapters under {selectedSubject.name}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {chapters.map((chap) => (
                    <div
                      key={chap._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{chap.name}</h4>
                        <span className={`inline-block mt-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${chap.importance === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {chap.importance} Importance
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/nursing/explainer/${chap._id}`)}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold px-3 py-2 text-xs hover:bg-emerald-100 transition shadow-sm"
                        >
                          <Sparkles size={13} className="fill-emerald-800" /> Learn with AI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartPractice(chap)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPracticeActive(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <span className="text-xs font-bold text-slate-400">{selectedChapter?.name}</span>
                <h2 className="text-lg font-black text-slate-800">Question {currentIndex + 1} of {questions.length}</h2>
              </div>
            </div>

            {/* Question Display Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <p className="text-lg font-bold text-slate-800 leading-relaxed">{questions[currentIndex]?.questionText}</p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optionText = questions[currentIndex]?.options?.[opt]?.text;
                  const isCorrectAnswer = opt === questions[currentIndex]?.correctAnswer;
                  const isSelected = opt === selectedOption;

                  let optStyle = 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20';
                  if (isSelected && !isAnswered) {
                    optStyle = 'border-emerald-500 bg-emerald-50/40 text-emerald-800';
                  } else if (isAnswered) {
                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold';
                    } else if (isSelected) {
                      optStyle = 'border-red-500 bg-red-50 text-red-800';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionSelect(opt)}
                      disabled={isAnswered}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${optStyle}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${isSelected ? 'bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{opt}</span>
                      <span className="text-sm font-medium">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanations */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {selectedOption === questions[currentIndex].correctAnswer ? (
                        <span className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-600"><CheckCircle size={18} /> Correct Answer!</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-extrabold text-red-600"><XCircle size={18} /> Incorrect</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <strong>Explanation:</strong> {questions[currentIndex].explanation?.text || 'No explanation available.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                {!isAnswered ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition disabled:opacity-50"
                  >
                    Submit Response
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
                  >
                    Next Question <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NursingPracticePage;
