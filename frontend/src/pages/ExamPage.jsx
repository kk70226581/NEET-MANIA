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
    if (!loading && exam.testState === 'in_progress' && document.documentElement.requestFullscreen) {
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
      <div className="nta-loading-screen">
        <div className="nta-loading-card">
          <div className="loader" />
          <strong>Preparing your examination</strong>
          <span>Loading the paper and restoring saved responses…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nta-exam-page">
      <ExamHeader
        timeRemaining={timeRemaining}
        totalQuestions={questions.length}
        onSubmit={handleSubmit}
        onFullscreen={!isFullscreen ? enterFullscreen : null}
        isLowTime={isLowTime}
        isCriticalTime={isCriticalTime}
      />

      {subjectSections.length > 1 && (
        <nav className="nta-subject-tabs" aria-label="Exam sections">
          <span>Sections</span>
          {subjectSections.map((section) => (
            <button
              type="button"
              key={section.subject}
              onClick={() => dispatch(setCurrentQuestion(section.startIndex))}
              className={currentQuestion?.subject === section.subject ? 'is-active' : ''}
            >
              {section.subject.charAt(0).toUpperCase() + section.subject.slice(1)}
            </button>
          ))}
        </nav>
      )}

      <div className="nta-exam-workspace">
        <main className="nta-question-workspace">
          {currentQuestion && (
            <QuestionDisplay
              question={currentQuestion}
              questionIndex={exam.currentQuestionIndex}
              totalQuestions={questions.length}
              savedResponse={exam.responses[currentQuestion._id]}
              onSave={handleSaveResponse}
              onClear={handleClearResponse}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={exam.currentQuestionIndex === 0}
              isLast={exam.currentQuestionIndex === questions.length - 1}
            />
          )}
        </main>

        <aside className="nta-palette-workspace">
          <QuestionPalette
            questions={questions}
            currentIndex={exam.currentQuestionIndex}
            responses={exam.responses}
            markedForReview={exam.markedForReview}
            visitedQuestions={visitedQuestions}
            onSelectQuestion={(index) => dispatch(setCurrentQuestion(index))}
          />
        </aside>
      </div>

      {showSubmitConfirm && (
        <div className="nta-modal-backdrop">
          <div className="nta-submit-modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">
            <div className="nta-submit-modal-heading">
              <h2 id="submit-title">Submit Examination?</h2>
              <span>Please review your attempt summary</span>
            </div>
            <div className="nta-submit-summary">
              <div><strong>{answeredCount}</strong><span>Answered</span></div>
              <div><strong>{notAnsweredCount}</strong><span>Not Answered</span></div>
              <div><strong>{markedCount}</strong><span>Marked</span></div>
            </div>
            <p>After submission, responses cannot be changed.</p>
            <div className="nta-submit-modal-actions">
              <button type="button" onClick={() => setShowSubmitConfirm(false)}>Return to Test</button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  performSubmit();
                }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
