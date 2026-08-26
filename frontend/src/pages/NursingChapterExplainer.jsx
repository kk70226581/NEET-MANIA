import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';
import { nursingAPI } from '../services/api';

const NursingChapterExplainer = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [topicName, setTopicName] = useState('');
  const [explanation, setExplanation] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Stats / Progress
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    nursingAPI.startExplainer(chapterId)
      .then(res => {
        const d = res.data;
        setTopicName(d.topicName);
        setExplanation(d.explanation);
        setQuestionText(d.questionText);
        setOptions(d.options);
        setCorrectAnswer(d.correctAnswer);
      })
      .catch(err => {
        console.error('Failed to start explainer:', err);
        toast.error('Could not connect to Bedrock AI Tutor.');
      })
      .finally(() => setLoading(false));
  }, [chapterId]);

  const handleSubmitAnswer = () => {
    if (!userAnswer || isAnswered || submitting) return;
    setSubmitting(true);

    nursingAPI.continueExplainer({
      chapterId,
      topicName,
      previousQuestion: questionText,
      userAnswer,
      correctAnswer
    })
      .then(res => {
        const d = res.data;
        setFeedback(d.feedback);
        setIsAnswered(true);

        // Prep the next step values (we'll show a "Continue" button to transition)
        // Store next topic data in a temp object so we transition smoothly
        setNextStepData(d);
      })
      .catch(err => {
        console.error('Failed to continue explanation:', err);
        toast.error('AI Tutor connection timeout.');
      })
      .finally(() => setSubmitting(false));
  };

  const [nextStepData, setNextStepData] = useState(null);

  const handleNextTopic = () => {
    if (!nextStepData) return;
    setTopicName(nextStepData.nextTopicName);
    setExplanation(nextStepData.nextExplanation);
    setQuestionText(nextStepData.nextQuestionText);
    setOptions(nextStepData.nextOptions);
    setCorrectAnswer(nextStepData.nextCorrectAnswer);

    setUserAnswer(null);
    setFeedback('');
    setIsAnswered(false);
    setNextStepData(null);
    setCompletedCount(prev => prev + 1);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/bsc-nursing/practice')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-xs font-bold text-slate-400">Conversational AI Tutor (Powered by AWS Bedrock)</span>
            <h2 className="text-xl font-black text-slate-800">Topic-by-Topic Learning</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Topic & Explanation bubble */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider">
                <Sparkles size={14} className="fill-emerald-500" /> Active Topic: {topicName}
              </span>
              <p className="text-base text-slate-700 leading-relaxed font-medium">{explanation}</p>
            </div>

            {/* Test Question Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 uppercase">Tutor Checkpoint</span>
              <p className="text-lg font-bold text-slate-800 leading-relaxed">{questionText}</p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {options && Object.entries(options).map(([optKey, optText]) => {
                  const isSelected = userAnswer === optKey;
                  let btnStyle = 'border-slate-200 hover:border-emerald-500';
                  if (isSelected) {
                    btnStyle = 'border-emerald-500 bg-emerald-50/20';
                  }

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => !isAnswered && setUserAnswer(optKey)}
                      disabled={isAnswered}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${btnStyle}`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold ${isSelected ? 'bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{optKey}</span>
                      <span className="text-sm font-semibold">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback bubble */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {userAnswer === correctAnswer ? (
                        <span className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-600"><CheckCircle size={18} /> Correct!</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-extrabold text-red-600"><XCircle size={18} /> Incorrect</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <strong>Tutor Feedback:</strong> {feedback}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                {!isAnswered ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer || submitting}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50"
                  >
                    Submit Response <Send size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextTopic}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-950"
                  >
                    Continue to Next Topic
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

export default NursingChapterExplainer;
