import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const NursingExamCBT = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({}); // questionId -> selectedOption
  const [reviewed, setReviewed] = useState({}); // questionId -> boolean
  const [visited, setVisited] = useState({}); // questionId -> boolean

  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [instructionsRead, setInstructionsRead] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch test details
    axios.get(`http://localhost:5000/api/nursing/tests/${testId}/questions`, { headers })
      .then(res => {
        setQuestions(res.data.data || []);
      })
      .catch(err => {
        console.error('Failed to load questions:', err);
        toast.error('Could not load test questions.');
      });

    // We can also fetch the mock test details directly
    axios.get(`http://localhost:5000/api/nursing/exams`, { headers })
      .then(res => {
        // Find standard AIIMS test configuration
        setTest({
          testName: 'B.Sc. Nursing Entrance Full Mock Paper',
          duration: 120,
          totalQuestions: 100,
          totalMarks: 100
        });
      });

    // Prevent accidental refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress is auto-saved.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  const handleStartExam = () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.post(`http://localhost:5000/api/nursing/tests/${testId}/start`, {}, { headers })
      .then(res => {
        setAttempt(res.data.data);
        setTimeRemaining(res.data.data.timeRemaining);
        setInstructionsRead(true);

        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmitTest(); // Auto submit
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Mark first question as visited
        if (questions.length > 0) {
          setVisited({ [questions[0]._id]: true });
        }
      })
      .catch(err => {
        console.error('Start attempt failed:', err);
        toast.error('Could not initialize exam session.');
      });
  };

  const handleSelectOption = (opt) => {
    const qId = questions[currentIndex]._id;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleClearResponse = () => {
    const qId = questions[currentIndex]._id;
    setAnswers(prev => ({ ...prev, [qId]: null }));
    saveProgress(null, false);
  };

  const saveProgress = (selectedOpt, markReview) => {
    const token = localStorage.getItem('token');
    const currentQ = questions[currentIndex];

    axios.put(`http://localhost:5000/api/nursing/tests/attempts/${attempt.attemptId}/response`, {
      questionId: currentQ._id,
      selectedOption: selectedOpt,
      markedForReview: markReview,
      timeRemaining: timeRemaining
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => console.error('Auto-save response failed:', err));
  };

  const handleSaveAndNext = () => {
    const qId = questions[currentIndex]._id;
    saveProgress(answers[qId] || null, reviewed[qId] || false);

    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setVisited(prev => ({ ...prev, [questions[nextIndex]._id]: true }));
    }
  };

  const handleMarkForReview = () => {
    const qId = questions[currentIndex]._id;
    setReviewed(prev => ({ ...prev, [qId]: true }));
    saveProgress(answers[qId] || null, true);

    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setVisited(prev => ({ ...prev, [questions[nextIndex]._id]: true }));
    }
  };

  const handleSubmitTest = () => {
    if (submitting) return;
    setSubmitting(true);

    const token = localStorage.getItem('token');
    axios.put(`http://localhost:5000/api/nursing/tests/attempts/${attempt.attemptId}/submit`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        toast.success('Exam submitted successfully!');
        if (timerRef.current) clearInterval(timerRef.current);
        navigate(`/nursing/results/${attempt.attemptId}`);
      })
      .catch(err => {
        console.error('Submission failed:', err);
        toast.error('Failed to submit exam.');
        setSubmitting(false);
      });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Timer formatter
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!instructionsRead) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-slate-800 border-b pb-4">Computer-Based Examination Instructions</h2>
          <div className="text-slate-600 space-y-3 text-sm leading-relaxed">
            <p>1. The duration of this exam is 120 minutes (2 Hours).</p>
            <p>2. The question paper consists of 100 Multiple Choice Questions (MCQs).</p>
            <p>3. Dynamic marking schemes are enforced based on the exam selected:</p>
            <ul className="list-disc pl-5">
              <li><strong>AIIMS B.Sc. Nursing:</strong> +1 for correct answers, -1/3 for incorrect answers.</li>
              <li><strong>CNET UP:</strong> +1 for correct answers, 0 for incorrect.</li>
            </ul>
            <p>4. Your session auto-saves periodically. In case of network drops, you can resume seamlessly.</p>
          </div>
          <div className="flex items-center gap-3 border-t pt-6 justify-end">
            <button
              type="button"
              onClick={handleStartExam}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 shadow-md"
            >
              I am Ready to Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans select-none">
      {/* Header bar */}
      <header className="h-16 shrink-0 bg-slate-900 text-white px-6 flex items-center justify-between shadow-md">
        <h2 className="font-black tracking-tight">{test?.testName || 'B.Sc. Nursing Exam'}</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-lg text-sm font-bold text-emerald-400">
            <Clock size={16} /> {formatTime(timeRemaining)}
          </div>
          <button type="button" onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* Main panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Question Display */}
        <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-black uppercase text-slate-400">Question {currentIndex + 1}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">Single Correct MCQ</span>
            </div>

            <p className="text-lg font-bold text-slate-800 leading-relaxed">{questions[currentIndex]?.questionText}</p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optText = questions[currentIndex]?.options?.[opt]?.text;
                const isSelected = answers[questions[currentIndex]?._id] === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500'}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold ${isSelected ? 'bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{opt}</span>
                    <span className="text-sm font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mt-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkForReview}
                className="rounded-xl border border-amber-300 bg-amber-50/20 text-amber-700 px-5 py-3 text-xs font-bold hover:bg-amber-50"
              >
                Mark for Review & Next
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                className="rounded-xl border border-slate-200 text-slate-600 px-5 py-3 text-xs font-bold hover:bg-slate-50"
              >
                Clear Response
              </button>
            </div>
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md"
            >
              Save & Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Status Palette */}
        <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-800 border-b pb-3">Question Palette</h3>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const qId = q._id;
                const isAns = !!answers[qId];
                const isRev = !!reviewed[qId];
                const isVis = !!visited[qId];

                let btnClass = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isAns && isRev) {
                  btnClass = 'bg-purple-500 text-white border-purple-600 shadow';
                } else if (isAns) {
                  btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow';
                } else if (isRev) {
                  btnClass = 'bg-amber-500 text-white border-amber-600 shadow';
                } else if (isVis) {
                  btnClass = 'bg-red-500 text-white border-red-600 shadow';
                }

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setVisited(prev => ({ ...prev, [qId]: true }));
                    }}
                    className={`h-10 w-10 text-xs font-bold rounded-lg border flex items-center justify-center transition-all hover:scale-105 ${btnClass} ${currentIndex === idx ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 mt-6">
            <button
              type="button"
              onClick={handleSubmitTest}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3.5 rounded-xl shadow-lg"
            >
              Submit Exam Paper
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NursingExamCBT;
