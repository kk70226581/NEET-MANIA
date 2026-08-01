import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertOctagon, RefreshCw, Layers, Check, Trash2, Mail } from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';

const NursingAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    axios.get('http://localhost:5000/api/nursing/admin/overview', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOverview(res.data.data))
      .catch(err => {
        console.error('Failed to load admin overview:', err);
        toast.error('Could not load administrative monitoring dashboard.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleResolveReport = (reportId) => {
    const token = localStorage.getItem('token');
    axios.post(`http://localhost:5000/api/nursing/admin/reports/${reportId}/resolve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        toast.success('Student report marked as resolved.');
        fetchOverview();
      })
      .catch(err => console.error('Failed to resolve report:', err));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">B.Sc. Nursing Admin Monitoring Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Automated updater scans status, content coverage check, and verification controls.</p>
          </div>
          <button
            type="button"
            onClick={fetchOverview}
            className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition"
          >
            <RefreshCw size={15} /> Refresh Overview
          </button>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Questions In Bank</span>
                <strong className="mt-2 block text-3xl font-black text-slate-800">{overview?.totalQuestionsCount || 0}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Content Gaps (&lt;100 Qs)</span>
                <strong className="mt-2 block text-3xl font-black text-amber-600">{overview?.gapsCount || 0} Chapters</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Unresolved Student Reports</span>
                <strong className="mt-2 block text-3xl font-black text-red-500">{overview?.studentReports?.length || 0}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Failed Automated Jobs</span>
                <strong className="mt-2 block text-3xl font-black text-red-500">{overview?.failedJobsCount || 0}</strong>
              </div>
            </div>

            {/* Coverage Gaps List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-amber-500" /> Syllabus Coverage Gap Report (&lt; 100 questions)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {overview?.coverageGaps?.map((gap, idx) => (
                  <div key={idx} className="rounded-xl bg-amber-50/50 border border-amber-200/60 p-4">
                    <h4 className="font-bold text-slate-800 text-sm">{gap.chapterName}</h4>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{gap.subjectName}</p>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Current Qs: {gap.currentCount}</span>
                      <span className="text-amber-700">Target: {gap.targetCount}</span>
                    </div>
                  </div>
                ))}
                {overview?.coverageGaps?.length === 0 && (
                  <p className="text-sm text-emerald-600 font-semibold">✅ All chapters satisfy the minimum target of 100 questions!</p>
                )}
              </div>
            </div>

            {/* Student Reported Questions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertOctagon size={18} className="text-red-500" /> Student Reported Questions
              </h3>
              {overview?.studentReports?.length === 0 ? (
                <p className="text-xs text-slate-400">No pending student error reports.</p>
              ) : (
                <div className="space-y-4">
                  {overview.studentReports.map((report) => (
                    <div key={report._id} className="rounded-xl border border-slate-200 p-4 flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">{report.reportType}</span>
                        <h4 className="text-sm font-bold text-slate-800">Q: "{report.question?.questionText}"</h4>
                        <p className="text-xs text-slate-500">Student Comments: "{report.comments || 'No comments'}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs shadow hover:bg-emerald-600 transition"
                      >
                        <Check size={14} /> Mark Resolved
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NursingAdminDashboard;
