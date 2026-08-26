/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';
import { nursingAPI } from '../services/api';

const NursingResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    nursingAPI.getTestResults(attemptId)
      .then(res => {
        setResults(res.data);
      })
      .catch(err => {
        console.error('Failed to load attempt results:', err);
        toast.error('Could not load test results.');
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const { attempt, analysis } = results || {};

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">CBT Scorecard & Diagnostics</h1>
          <p className="mt-1 text-sm text-slate-500">Review your performance, marking scheme details, and weak areas.</p>
        </div>

        {/* Overview Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Score</span>
              <strong className="mt-2 block text-4xl font-black text-emerald-600">{attempt?.score} / {attempt?.maxScore}</strong>
            </div>
            <p className="mt-4 text-xs text-slate-500">Graded based on exam-specific negative marking rules.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-2 gap-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle size={20} /></span>
              <div>
                <span className="block text-xl font-bold text-slate-800">{attempt?.analysis?.correct}</span>
                <span className="text-xs text-slate-500">Correct Answers</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><XCircle size={20} /></span>
              <div>
                <span className="block text-xl font-bold text-slate-800">{attempt?.analysis?.wrong}</span>
                <span className="text-xs text-slate-500">Incorrect Answers</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Clock size={20} /></span>
              <div>
                <span className="block text-xl font-bold text-slate-800">{attempt?.analysis?.averageTimePerQuestion}s</span>
                <span className="text-xs text-slate-500">Avg Time per Q</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><TrendingUp size={20} /></span>
              <div>
                <span className="block text-xl font-bold text-slate-800">{attempt?.analysis?.accuracy}%</span>
                <span className="text-xs text-slate-500">Accuracy Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis tables */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Subject-wise Breakdown</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 text-left uppercase">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Questions</th>
                    <th className="px-6 py-4">Attempted</th>
                    <th className="px-6 py-4">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {Object.entries(analysis?.subjectAnalysis || {}).map(([subId, stats]) => (
                    <tr key={subId}>
                      <td className="px-6 py-4 font-bold text-slate-800 capitalize">{subId}</td>
                      <td className="px-6 py-4">{stats.total}</td>
                      <td className="px-6 py-4">{stats.attempted} ({stats.correct} correct)</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${stats.attempted > 0 && (stats.correct / stats.attempted) >= 0.6 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800">Personalized Diagnostics</h3>
            <div className="space-y-4">
              {analysis?.weakAreas?.length > 0 ? (
                <div className="flex gap-3 bg-red-50 text-red-800 p-4 rounded-xl">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Weak Chapters Identified</h4>
                    <p className="mt-1 text-xs text-red-700">You scored below 60% in these chapters. We recommend immediate revision.</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 bg-emerald-50 text-emerald-800 p-4 rounded-xl">
                  <CheckCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">All Clear!</h4>
                    <p className="mt-1 text-xs text-emerald-700">Great accuracy across all topics attempted.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/bsc-nursing/practice')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-950"
            >
              Start Revision Sessions <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default NursingResultsPage;
