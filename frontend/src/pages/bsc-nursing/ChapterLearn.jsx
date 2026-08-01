import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, BookOpen, BrainCircuit, RefreshCw, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../../components/AppShell';

const ChapterLearn = () => {
  const { chapterSlug } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [doubtResponse, setDoubtResponse] = useState(null);

  useEffect(() => {
    fetchSyllabus();
  }, [chapterSlug]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      // Fetch topics for the chapter
      const res = await axios.get(`/api/nursing/syllabus/topics?chapterSlug=${chapterSlug}`);
      if (res.data.success) {
        setChapter(res.data.chapter);
        setTopics(res.data.topics);
        if (res.data.topics.length > 0) {
          setActiveTopic(res.data.topics[0]);
          generateExplanation(res.data.topics[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chapter data.');
    } finally {
      setLoading(false);
    }
  };

  const generateExplanation = async (topicId) => {
    try {
      setGenerating(true);
      setExplanation(null);
      const res = await axios.post('/api/nursing/ai/explain-topic', {
        topicId,
        language: 'english'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data.success) {
        setExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI explanation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAskDoubt = async () => {
    if (!doubtText.trim()) return;
    try {
      const res = await axios.post('/api/nursing/ai/solve-doubt', {
        doubtText,
        chapterSlug: chapter?.fullChapterName,
        topicSlug: activeTopic?.name
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data.success) {
        setDoubtResponse(res.data.answer);
        setDoubtText('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to solve doubt.');
    }
  };

  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    generateExplanation(topic._id);
    setDoubtResponse(null);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] bg-gray-50">
        
        {/* Left Sidebar: Topics */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden hidden md:flex">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg text-gray-900 truncate" title={chapter?.fullChapterName}>
              {chapter?.fullChapterName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Interactive Learning</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {topics.map((t, idx) => (
              <button
                key={t._id}
                onClick={() => handleTopicChange(t)}
                className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                  activeTopic?._id === t._id 
                    ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  activeTopic?._id === t._id ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm line-clamp-2">{t.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 block">Topic</span>
              <h1 className="text-xl font-bold text-gray-900">{activeTopic?.name || 'Select a topic'}</h1>
            </div>
            {generating && (
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                AI is generating...
              </div>
            )}
          </div>

          {/* Explanation Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
            <AnimatePresence mode="wait">
              {explanation ? (
                <motion.div
                  key={explanation.topicName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-4xl mx-auto space-y-8 pb-32"
                >
                  
                  {/* Learning Objective */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                      <BookOpen className="w-5 h-5" /> Learning Objective
                    </h3>
                    <p className="text-blue-800">{explanation.learningObjective}</p>
                  </div>

                  {/* Simple Explanation */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-6 h-6 text-indigo-500" /> Core Concept
                    </h3>
                    <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed text-lg">
                      <p>{explanation.simpleExplanation}</p>
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">Detailed Breakdown</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{explanation.detailedExplanation}</p>
                  </div>

                  {/* Key Terms & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {explanation.keyTerms && explanation.keyTerms.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Key Terms</h4>
                        <ul className="space-y-3">
                          {explanation.keyTerms.map((term, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-semibold text-indigo-700">{term.term}:</span>{' '}
                              <span className="text-gray-600">{term.definition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {explanation.importantPoints && explanation.importantPoints.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                        <h4 className="font-semibold text-orange-900 mb-4 border-b border-orange-200 pb-2">Exam High-Yield</h4>
                        <ul className="space-y-2 list-disc list-inside text-orange-800 text-sm">
                          {explanation.importantPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Example & Formula */}
                  {(explanation.example || explanation.formulaOrProcess) && (
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                      {explanation.formulaOrProcess && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" /> Key Process / Formula
                          </h4>
                          <p className="mt-2 font-mono bg-emerald-100 p-3 rounded text-emerald-800">{explanation.formulaOrProcess}</p>
                        </div>
                      )}
                      {explanation.example && (
                        <div>
                          <h4 className="font-semibold text-emerald-900 mb-2">Example</h4>
                          <p className="text-emerald-800 italic">{explanation.example}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Traps and Mistakes */}
                  {(explanation.commonMistakes || explanation.examTraps) && (
                    <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Exam Traps & Mistakes
                      </h4>
                      {explanation.commonMistakes && <p className="mb-2 text-red-800"><strong>Mistake:</strong> {explanation.commonMistakes}</p>}
                      {explanation.examTraps && <p className="text-red-800"><strong>Trap:</strong> {explanation.examTraps}</p>}
                    </div>
                  )}
                  
                  {/* Quick Checks */}
                  {explanation.quickCheckQuestions && explanation.quickCheckQuestions.length > 0 && (
                    <div className="border border-indigo-100 bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-indigo-600 text-white px-6 py-3 font-semibold flex items-center justify-between">
                        <span>Quick Concept Check</span>
                        <CheckCircle className="w-5 h-5 opacity-80" />
                      </div>
                      <div className="p-6 space-y-6">
                        {explanation.quickCheckQuestions.map((q, i) => (
                          <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <p className="font-medium text-gray-900 mb-3">Q{i+1}. {q.question}</p>
                            <div className="space-y-2 mb-3">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 text-gray-600 text-sm p-2 bg-gray-50 rounded border border-gray-200">
                                  <span className="font-bold w-6 text-center">{String.fromCharCode(65 + oi)}</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                            <details className="text-sm">
                              <summary className="text-indigo-600 cursor-pointer font-medium hover:text-indigo-800">Show Answer & Explanation</summary>
                              <div className="mt-3 p-3 bg-green-50 text-green-800 rounded border border-green-200">
                                <strong>Correct Answer: {q.correctAnswer}</strong>
                                <p className="mt-1">{q.explanation}</p>
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doubt Solving Section */}
                  <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-md relative mt-12">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600" /> Have a doubt about this topic?
                    </h3>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        placeholder="Ask any question..." 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAskDoubt()}
                      />
                      <button 
                        onClick={handleAskDoubt}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Ask AI
                      </button>
                    </div>

                    {doubtResponse && (
                      <div className="mt-6 p-5 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="font-semibold text-indigo-900 mb-2">{doubtResponse.directAnswer}</p>
                        <p className="text-indigo-800 mb-4 text-sm">{doubtResponse.conceptExplanation}</p>
                        
                        {doubtResponse.example && (
                          <div className="mb-3 text-sm">
                            <span className="font-semibold text-indigo-900">Example:</span> {doubtResponse.example}
                          </div>
                        )}
                        {doubtResponse.commonMistake && (
                          <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                            <span className="font-semibold">Common Mistake:</span> {doubtResponse.commonMistake}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </motion.div>
              ) : !generating && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a topic or refresh to load explanation.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ChapterLearn;
