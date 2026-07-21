import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  MinusCircle,
  Target,
  Trophy,
  XCircle,
  TrendingUp,
  BookOpen,
  Share2,
  BrainCircuit,
  MessageSquare,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const ResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'correct', 'incorrect', 'skipped'
  const [explanations, setExplanations] = useState({}); // { questionId: { loading, text, error } }

  useEffect(() => {
    let active = true;
    testsAPI.getResults(attemptId)
      .then((response) => {
        if (active) setResult(response.data);
      })
      .catch((error) => toast.error(error.message || 'Could not load this result.'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attemptId]);

  const stats = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Correct', value: result.questionsCorrect ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
      { label: 'Incorrect', value: result.questionsWrong ?? 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
      { label: 'Skipped', value: result.questionsSkipped ?? 0, icon: MinusCircle, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
      { label: 'Negative Marks', value: result.negativeMarks ?? 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
      { label: 'Avg. Time/Q', value: `${Math.round(Number(result.averageTimePerQuestion) || 0)}s`, icon: Clock3, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    ];
  }, [result]);

  const handleAskAI = async (questionId) => {
    setExplanations(prev => ({
      ...prev,
      [questionId]: { loading: true, text: null, error: null }
    }));

    try {
      const response = await testsAPI.explainQuestion(attemptId, questionId);
      setExplanations(prev => ({
        ...prev,
        [questionId]: { loading: false, text: response.data.explanation, error: null }
      }));
    } catch (err) {
      setExplanations(prev => ({
        ...prev,
        [questionId]: { loading: false, text: null, error: err.message || 'Could not fetch explanation.' }
      }));
    }
  };

  if (loading) {
    return (
      <AppShell eyebrow="Performance" title="Result report">
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Preparing your report…</h3>
          <p className="text-slate-500 mt-2">Analyzing your performance data.</p>
        </div>
      </AppShell>
    );
  }

  if (!result) {
    return (
      <AppShell eyebrow="Performance" title="Result unavailable">
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Unavailable</h2>
          <p className="text-slate-600 mb-8 max-w-md">The attempt may still be in progress, or it may no longer be available in our records.</p>
          <button 
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors" 
            onClick={() => navigate('/attempts')}
          >
            Back to attempts
          </button>
        </div>
      </AppShell>
    );
  }

  const accuracy = Math.max(0, Math.min(100, Number(result.accuracy) || 0));
  const scorePercent = result.maxScore ? Math.max(0, (result.score / result.maxScore) * 100) : 0;

  // Filter review questions
  const filteredReview = (result.questionReview || []).filter((item) => {
    if (reviewFilter === 'correct') return item.isCorrect;
    if (reviewFilter === 'incorrect') return !item.isCorrect && !item.isSkipped;
    if (reviewFilter === 'skipped') return item.isSkipped;
    return true;
  });

  const countCorrect = (result.questionReview || []).filter(item => item.isCorrect).length;
  const countIncorrect = (result.questionReview || []).filter(item => !item.isCorrect && !item.isSkipped).length;
  const countSkipped = (result.questionReview || []).filter(item => item.isSkipped).length;
  const countAll = (result.questionReview || []).length;

  return (
    <AppShell
      eyebrow="Performance"
      title="Result report"
      actions={
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors"
            onClick={() => {
              const code = result?.testCode || result?.testId;
              if (code) {
                const shareUrl = `${window.location.origin}/exam/${code}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Test link copied to clipboard!');
              } else {
                toast.error('Could not generate share link.');
              }
            }}
          >
            <Share2 size={18} />
            <span>Share Test</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg shadow-sm transition-colors"
            onClick={() => window.print()}
          >
            <Download size={18} />
            <span>Print scorecard</span>
          </button>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <button 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors" 
          onClick={() => navigate('/attempts')}
        >
          <ArrowLeft size={18} /> Back to attempts
        </button>
 
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="relative flex-shrink-0 flex items-center justify-center w-48 h-48 rounded-full bg-slate-50 shadow-inner border-[8px] border-indigo-100">
              <div className="absolute inset-0 rounded-full border-[8px] border-indigo-600" style={{ clipPath: `polygon(50% 50%, -50% -50%, ${scorePercent > 50 ? '150% -50%, 150% 150%, -50% 150%' : '150% -50%'})` }}></div>
              <div className="text-center z-10 bg-white w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-sm">
                <strong className="text-4xl font-extrabold text-slate-800">{result.score ?? 0}</strong>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">of {result.maxScore ?? 0}</span>
              </div>
            </div>
 
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-widest rounded-full">
                  Test Complete
                </span>
                {result.testCode && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result.testCode);
                      toast.success('Test Code copied!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full transition-colors"
                  >
                    <span>Test Code: {result.testCode}</span>
                    <span className="text-[10px] text-emerald-600 bg-white px-1.5 py-0.5 rounded-full border border-emerald-200">Copy</span>
                  </button>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                {accuracy >= 75 ? 'Exceptional work. Keep the edge.' : accuracy >= 50 ? 'A solid baseline.' : 'Now we know what to fix.'}
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl">
                Your score is securely saved. Review your accuracy and timing metrics below to plan your next highly focused revision session.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-sm">
                  <Trophy size={18} className="text-amber-500" /> 
                  {accuracy.toFixed(1)}% Accuracy
                </div>
                {result.rankPrediction && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-sm">
                    <Target size={18} className="text-indigo-500" /> 
                    Predicted Rank: {result.rankPrediction.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div className={`flex flex-col p-5 bg-white rounded-2xl shadow-sm border border-slate-200 transition-transform hover:-translate-y-1 duration-200`} key={label}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${bg} ${color}`}>
                <Icon size={20} />
              </div>
              <strong className="text-2xl font-bold text-slate-800 mb-1">{value}</strong>
              <span className="text-sm font-medium text-slate-500">{label}</span>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          {/* Accuracy Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Attempt Quality</span>
                  <h3 className="text-2xl font-bold text-slate-800">Accuracy Analysis</h3>
                </div>
                <strong className="text-3xl font-extrabold text-indigo-600">{accuracy.toFixed(1)}%</strong>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                <div 
                  className={`h-4 rounded-full ${accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                  style={{ width: `${accuracy}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              <TrendingUp size={20} className="text-slate-400" />
              <p>You attempted <strong>{result.questionsAttempted ?? 0}</strong> out of {result.totalQuestions} questions.</p>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BookOpen size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2 block">Study Recommendation</span>
              <h3 className="text-3xl font-bold mb-4">What to do next</h3>
              <p className="text-indigo-100 text-lg leading-relaxed mb-8 max-w-sm">
                {result.analysis || 'Review the questions you missed, note the concept behind each error, and take a shorter focused test next.'}
              </p>
            </div>
            <button 
              className="relative z-10 w-full py-4 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-lg rounded-xl shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => navigate('/dashboard')}
            >
              Build your next test
            </button>
          </div>
        </section>

        {/* Subject Breakdown */}
        {result.subjectAnalysis && (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Subject Breakdown</span>
              <h3 className="text-2xl font-bold text-slate-800">Where the marks came from</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Attempted</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Correct</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Accuracy</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(result.subjectAnalysis)
                    .filter(([, data]) => data && (data.attempted || data.skipped))
                    .map(([subject, data]) => {
                      const subjAccuracy = data.attempted ? ((data.correct / data.attempted) * 100).toFixed(1) : 0;
                      return (
                        <tr key={subject} className="hover:bg-slate-50 transition-colors">
                          <td className="py-5 px-4 font-bold text-slate-800 capitalize">{subject}</td>
                          <td className="py-5 px-4 font-medium text-slate-600">{data.attempted || 0}</td>
                          <td className="py-5 px-4 font-medium text-emerald-600">{data.correct || 0}</td>
                          <td className="py-5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              subjAccuracy >= 75 ? 'bg-emerald-100 text-emerald-800' :
                              subjAccuracy >= 50 ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {subjAccuracy}%
                            </span>
                          </td>
                          <td className="py-5 px-4 font-extrabold text-indigo-600">{data.score || 0}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mock Test Analysis Section */}
        {result.questionReview?.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Mock Exam Analysis</span>
                <h3 className="text-2xl font-bold text-slate-800">Interactive Question Breakdown</h3>
                <p className="text-slate-500 mt-1">Review each question, see your status, and clear doubts in Hinglish with your AI Mentor Bhaiya.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
                {[
                  { id: 'all', label: `All (${countAll})` },
                  { id: 'correct', label: `Correct (${countCorrect})` },
                  { id: 'incorrect', label: `Incorrect (${countIncorrect})` },
                  { id: 'skipped', label: `Skipped (${countSkipped})` }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setReviewFilter(item.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                      reviewFilter === item.id 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {filteredReview.map((item, index) => {
                const reference = item.ncertReference;
                const pageLabel = reference?.page || reference?.pdfPage;
                const aiExp = explanations[item.questionId];

                return (
                  <article key={item.questionId} className="rounded-2xl border border-slate-200 p-5 md:p-6 bg-slate-50/70 hover:bg-slate-50/90 transition-colors">
                    {/* Badge and Details Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                        <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">Question {index + 1}</span>
                        <span className="text-slate-500 capitalize">{item.subject} · {item.chapter}</span>
                      </div>
                      
                      {/* Status Tag */}
                      {item.isSkipped ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold border border-amber-200">
                          <HelpCircle size={14} /> Skipped (0)
                        </span>
                      ) : item.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                          <CheckCircle2 size={14} /> Correct (+4)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold border border-rose-200">
                          <XCircle size={14} /> Incorrect (-1)
                        </span>
                      )}
                    </div>

                    {/* Question Text */}
                    <h4 className="font-bold text-slate-800 leading-relaxed mb-5 whitespace-pre-wrap">
                      {item.questionText?.replace(/\[[a-f0-9]{8}\]$/i, '').trim()}
                    </h4>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const optionText = item.options?.[opt]?.text || '';
                        if (!optionText) return null;

                        const isUserChoice = item.selectedOption === opt;
                        const isCorrectAnswer = item.correctOption === opt;

                        let cardStyle = 'border-slate-200 bg-white text-slate-700';
                        let badgeText = '';

                        if (isCorrectAnswer) {
                          cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-sm';
                          badgeText = isUserChoice ? 'Your Answer (Correct)' : 'Correct Option';
                        } else if (isUserChoice) {
                          cardStyle = 'border-rose-400 bg-rose-50/50 text-rose-950 font-semibold';
                          badgeText = 'Your Answer';
                        }

                        return (
                          <div 
                            key={opt}
                            className={`flex justify-between items-center p-4 border rounded-xl transition-all ${cardStyle}`}
                          >
                            <span className="text-sm">
                              <strong className="mr-2">({opt})</strong> {optionText}
                            </span>
                            {badgeText && (
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isCorrectAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {badgeText}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* NCERT Reference & Explanation Row */}
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-t border-slate-200/60 pt-4">
                      {reference?.chapter ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-indigo-50/50 border border-indigo-100/60 px-4 py-2.5 text-xs text-indigo-800">
                          <BookOpen size={15} />
                          <strong>NCERT Class {reference.class}</strong>
                          <span>· {reference.chapter}</span>
                          {pageLabel && <span>· PDF page {pageLabel}</span>}
                          {reference.edition && <span>· {reference.edition}</span>}
                          {reference.sourceUrl && (
                            <a href={reference.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline ml-2">
                              Open source
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs italic">Citation not indexed.</div>
                      )}

                      {/* AI Mentor Button */}
                      <button
                        onClick={() => handleAskAI(item.questionId)}
                        disabled={aiExp?.loading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-end md:self-auto hover:shadow-lg disabled:opacity-55"
                      >
                        <BrainCircuit size={16} />
                        <span>{aiExp ? 'Refresh AI Bhaiya Explanation' : 'Ask AI Mentor Bhaiya'}</span>
                      </button>
                    </div>

                    {/* AI Hinglish Explanation Container */}
                    {aiExp && (
                      <div className="mt-5 p-5 bg-purple-50/70 rounded-2xl border border-purple-100 flex gap-4 animate-fade-in shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">
                          Bhaiya
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <BrainCircuit size={14} /> AI Mentor Bhaiya (Hinglish Support)
                          </p>
                          {aiExp.loading ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                              <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                              <span>Thinking in Hinglish...</span>
                            </div>
                          ) : aiExp.error ? (
                            <p className="text-sm text-rose-600 font-semibold">{aiExp.error}</p>
                          ) : (
                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                              {aiExp.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default ResultsPage;
