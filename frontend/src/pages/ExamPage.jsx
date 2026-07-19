import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { testsAPI } from '../services/api';
import { initExam, saveResponse, submitExam, setCurrentQuestion } from '../store/slices/examSlice';
import toast from 'react-hot-toast';
import ExamHeader from '../components/ExamHeader';
import QuestionDisplay from '../components/QuestionDisplay';
import QuestionPalette from '../components/QuestionPalette';

const LOW_TIME_THRESHOLD_SECONDS = 5 * 60; // last 5 minutes
const CRITICAL_TIME_THRESHOLD_SECONDS = 60; // last 1 minute

const ExamPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exam = useSelector((state) => state.exam);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState(() => new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSubmittingRef = useRef(false);
  const questionStartTimeRef = useRef(Date.now());
  const timeSpentRef = useRef({}); // { [questionId]: secondsSpentSoFar }
  const previousQuestionIdRef = useRef(null);

  // ---------- Fetch test ----------
  useEffect(() => {
    let isMounted = true;
    const fetchTest = async () => {
      try {
        const [questionResponse, attemptResponse] = await Promise.all([
          testsAPI.getTestQuestions(testId),
          testsAPI.startTest(testId),
        ]);
        if (!isMounted) return;
        setQuestions(questionResponse.data.questions);
        const restoredResponses = attemptResponse.data.responses || [];
        const firstUnansweredIndex = questionResponse.data.questions.findIndex((question) => {
          const saved = restoredResponses.find(
            (response) => String(response.questionId) === String(question._id)
          );
          return !saved?.selectedOption;
        });
        setTimeRemaining(attemptResponse.data.timeRemaining ?? attemptResponse.data.totalTime * 60);
        timeSpentRef.current = Object.fromEntries(
          restoredResponses.map((response) => [
            String(response.questionId),
            Number(response.timeSpent) || 0,
          ])
        );
        setVisitedQuestions(new Set(
          restoredResponses
            .filter((response) => response.status && response.status !== 'not_visited')
            .map((response) => String(response.questionId))
        ));
        dispatch(initExam({
          attemptId: attemptResponse.data.attemptId,
          totalTime: attemptResponse.data.totalTime,
          timeRemaining: attemptResponse.data.timeRemaining,
          responses: restoredResponses,
          currentQuestionIndex: firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0,
        }));
      } catch (error) {
        toast.error('Failed to load test. Please try again.');
        navigate('/dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTest();
    return () => {
      isMounted = false;
    };
  }, [testId, dispatch, navigate]);

  const currentQuestion = questions[exam.currentQuestionIndex];

  // ---------- Subject tabs (Physics / Chemistry / Botany / Zoology, NTA-style) ----------
  const subjectSections = useMemo(() => {
    const sections = [];
    questions.forEach((q, idx) => {
      const subject = q.subject || 'General';
      let section = sections.find((s) => s.subject === subject);
      if (!section) {
        section = { subject, startIndex: idx };
        sections.push(section);
      }
    });
    return sections;
  }, [questions]);

  // ---------- Track which questions have been visited (for the 5-state NTA palette) ----------
  useEffect(() => {
    if (currentQuestion?._id) {
      setVisitedQuestions((prev) => {
        if (prev.has(currentQuestion._id)) return prev;
        const next = new Set(prev);
        next.add(currentQuestion._id);
        return next;
      });
    }
  }, [currentQuestion]);

  // ---------- Track real time spent per question instead of a hardcoded value ----------
  useEffect(() => {
    const prevId = previousQuestionIdRef.current;
    if (prevId) {
      const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
      timeSpentRef.current[prevId] = (timeSpentRef.current[prevId] || 0) + elapsed;
    }
    questionStartTimeRef.current = Date.now();
    previousQuestionIdRef.current = currentQuestion?._id || null;
  }, [exam.currentQuestionIndex, currentQuestion]);

  const getElapsedForCurrentQuestion = useCallback(() => {
    if (!currentQuestion?._id) return 0;
    const banked = timeSpentRef.current[currentQuestion._id] || 0;
    const current = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    return banked + current;
  }, [currentQuestion]);

  // ---------- Submit logic (guarded against double submission) ----------
  const performSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await testsAPI.submitTest(exam.attemptId);
      dispatch(submitExam());
      toast.success('Test submitted successfully!');
      navigate(`/results/${exam.attemptId}`);
    } catch (error) {
      toast.error('Error submitting test. Please try again.');
      isSubmittingRef.current = false;
    }
  }, [dispatch, exam.attemptId, navigate]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    toast('Time is up! Submitting your test...', { icon: '⏰' });
    await performSubmit();
  }, [performSubmit]);

  // ---------- Timer: set up ONCE per exam session, not recreated every tick ----------
  useEffect(() => {
    if (loading || exam.testState !== 'in_progress') return undefined;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam.testState, handleAutoSubmit]);

  // ---------- Warn before accidental refresh/close while exam is live ----------
  useEffect(() => {
    if (exam.testState !== 'in_progress') return undefined;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exam.testState]);

  // ---------- Disable right-click / copy / cut / paste during the live exam ----------
  useEffect(() => {
    if (exam.testState !== 'in_progress') return undefined;
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
    };
  }, [exam.testState]);

  // ---------- Tab-switch detection (mirrors proctored CBT behavior) ----------
  useEffect(() => {
    if (exam.testState !== 'in_progress') return undefined;
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    if (coarsePointer || window.innerWidth < 768) return undefined;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error('Switching tabs during the exam is not recommended.', { icon: '⚠️', id: 'tab-switch' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [exam.testState]);

  // ---------- Fullscreen handling ----------
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    if (!coarsePointer && window.innerWidth >= 768 && !loading && exam.testState === 'in_progress' && document.documentElement.requestFullscreen) {
      // Browsers often block this without a user gesture; the banner below is the fallback.
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [loading, exam.testState]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {
      toast.error('Could not enter fullscreen mode in this browser.');
    });
  };

  // ---------- Navigation ----------
  const handleNext = useCallback(() => {
    if (exam.currentQuestionIndex < questions.length - 1) {
      dispatch(setCurrentQuestion(exam.currentQuestionIndex + 1));
    }
  }, [dispatch, exam.currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (exam.currentQuestionIndex > 0) {
      dispatch(setCurrentQuestion(exam.currentQuestionIndex - 1));
    }
  }, [dispatch, exam.currentQuestionIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  // ---------- Response handlers ----------
  const handleSaveResponse = useCallback(
    (questionId, selectedOption, marked) => {
      dispatch(saveResponse({ questionId, selectedOption, markedForReview: marked }));
      testsAPI
        .saveResponse(exam.attemptId, {
          questionId,
          selectedOption,
          markedForReview: marked,
          timeSpent: getElapsedForCurrentQuestion(),
        })
        .catch(() => {
          toast.error('Your last answer may not have saved. Check your connection.', { id: 'save-error' });
        });
    },
    [dispatch, exam.attemptId, getElapsedForCurrentQuestion]
  );

  const handleClearResponse = useCallback(
    (questionId) => {
      const markedForReview = exam.markedForReview?.[questionId] || false;
      dispatch(saveResponse({ questionId, selectedOption: null, markedForReview }));
      testsAPI
        .saveResponse(exam.attemptId, {
          questionId,
          selectedOption: null,
          markedForReview,
          timeSpent: getElapsedForCurrentQuestion(),
        })
        .catch(() => {
          toast.error('Could not clear response. Check your connection.', { id: 'save-error' });
        });
    },
    [dispatch, exam.attemptId, exam.markedForReview, getElapsedForCurrentQuestion]
  );

  const handleSubmit = () => setShowSubmitConfirm(true);

  const answeredCount = useMemo(
    () =>
      Object.values(exam.responses || {}).filter(
        (r) => r && r.selectedOption !== null && r.selectedOption !== undefined
      ).length,
    [exam.responses]
  );
  const markedCount = useMemo(
    () => Object.values(exam.markedForReview || {}).filter(Boolean).length,
    [exam.markedForReview]
  );
  const notAnsweredCount = questions.length - answeredCount;

  const isLowTime = timeRemaining <= LOW_TIME_THRESHOLD_SECONDS;
  const isCriticalTime = timeRemaining <= CRITICAL_TIME_THRESHOLD_SECONDS;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full text-center border-t-4 border-blue-600">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Preparing your examination</h2>
          <p className="text-slate-500 font-medium">Loading the paper and restoring saved responses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-50 font-sans ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <ExamHeader
        timeRemaining={timeRemaining}
        totalQuestions={questions.length}
        onSubmit={handleSubmit}
        onFullscreen={!isFullscreen ? enterFullscreen : null}
        isLowTime={isLowTime}
        isCriticalTime={isCriticalTime}
      />

      {subjectSections.length > 1 && (
        <div className="flex bg-blue-600 text-white shadow-sm overflow-x-auto select-none shrink-0">
          {subjectSections.map((section, idx) => {
            const isActive = exam.currentQuestionIndex >= section.startIndex && 
                            (idx === subjectSections.length - 1 || exam.currentQuestionIndex < subjectSections[idx + 1].startIndex);
            return (
              <button
                key={section.subject}
                className={`min-w-fit flex-1 border-r border-blue-500 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors sm:flex-none sm:px-6 sm:text-sm sm:tracking-wider ${isActive ? 'bg-white text-blue-700 shadow-inner' : 'hover:bg-blue-700'}`}
                onClick={() => dispatch(setCurrentQuestion(section.startIndex))}
              >
                {section.subject}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 border-r border-gray-300">
          <QuestionDisplay
            question={currentQuestion}
            questionIndex={exam.currentQuestionIndex}
            totalQuestions={questions.length}
            savedResponse={exam.responses[String(currentQuestion._id)]}
            onSave={handleSaveResponse}
            onClear={handleClearResponse}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={exam.currentQuestionIndex === 0}
            isLast={exam.currentQuestionIndex === questions.length - 1}
          />
        </main>

        <aside className="w-80 flex-shrink-0 bg-white hidden md:block border-l border-gray-300 shadow-sm">
          <QuestionPalette
            questions={questions}
            currentIndex={exam.currentQuestionIndex}
            responses={exam.responses}
            markedForReview={exam.markedForReview}
            visitedQuestions={visitedQuestions}
            onSelectQuestion={(idx) => dispatch(setCurrentQuestion(idx))}
          />
        </aside>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Submit Assessment?</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Please review your attempt summary before final submission.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-green-50 p-3 rounded border border-green-100 flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-700">{answeredCount}</span>
                  <span className="text-green-800 font-semibold text-center">Answered</span>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-100 flex flex-col items-center">
                  <span className="text-2xl font-bold text-red-700">{notAnsweredCount}</span>
                  <span className="text-red-800 font-semibold text-center">Not Answered</span>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-100 flex flex-col items-center col-span-2">
                  <span className="text-2xl font-bold text-purple-700">{markedCount}</span>
                  <span className="text-purple-800 font-semibold text-center">Marked for Review</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="px-5 py-2 text-gray-700 font-semibold border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmittingRef.current}
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-md transition-colors flex items-center gap-2"
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    performSubmit();
                  }}
                  disabled={isSubmittingRef.current}
                >
                  {isSubmittingRef.current ? 'Submitting...' : 'Yes, Submit Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
