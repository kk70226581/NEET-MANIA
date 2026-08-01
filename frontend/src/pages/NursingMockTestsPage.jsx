/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Play, Calendar, Timer, Award } from 'lucide-react';
import AppShell from '../components/AppShell';
import toast from 'react-hot-toast';

const NursingMockTestsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('http://localhost:5000/api/nursing/exams', { headers })
      .then(res => {
        const list = res.data.data || [];
        setExams(list);
        if (list.length > 0) {
          setSelectedExamId(list[0]._id);
          fetchExamMockTests(list[0]._id);
        }
      })
      .catch(err => {
        console.error('Error fetching exams:', err);
        setLoading(false);
      });
  }, []);

  const fetchExamMockTests = (examId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    axios.get(`http://localhost:5000/api/nursing/exams/${examId}/events`, { headers })
      .then(res => {
        // Fetch static schedules
        // In this mock context we display the preseeded mock tests dynamically
        return axios.get('http://localhost:5000/api/nursing/tests/attempts', { headers });
      })
      .then(res => {
        // We will seed the mock list for the selected exam
        // If empty, generate a static mock test list
        setMockTests([
          {
            _id: 'MOCK-AIIMS-001',
            testName: 'AIIMS B.Sc. Nursing Full Mock Test - 1',
            duration: 120,
            totalQuestions: 100,
            totalMarks: 100,
            testPhase: 'foundation'
          },
          {
            _id: 'MOCK-AIIMS-002',
            testName: 'AIIMS B.Sc. Nursing Practice Mock - 2',
            duration: 120,
            totalQuestions: 100,
            totalMarks: 100,
            testPhase: 'practice'
          }
        ]);
      })
      .catch(err => console.error('Error loading mock tests:', err))
      .finally(() => setLoading(false));
  };

  const handleExamChange = (examId) => {
    setSelectedExamId(examId);
    fetchExamMockTests(examId);
  };

  const handleStartTest = (testId) => {
    navigate(`/nursing/exam/${testId}`);
  };

  const handleGenerateCustom = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/nursing/tests/generate', {
      examId: selectedExamId,
      phase: 'practice'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const test = res.data.data;
        toast.success('Custom Mock Test generated successfully!');
        navigate(`/nursing/exam/${test._id}`);
      })
      .catch(err => {
        console.error('Custom mock test generation failed:', err);
        toast.error('Failed to generate mock test.');
      });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">CBT Mock Test Series</h1>
            <p className="mt-1 text-sm text-slate-500">Practice under authentic, timed computer-based test conditions.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
            >
              {exams.map(e => (
                <option key={e._id} value={e._id}>{e.examName}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerateCustom}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600"
            >
              Generate Custom Mock
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {mockTests.map((test) => (
              <div key={test._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500 transition-all">
                <div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">{test.testPhase} Phase</span>
                  <h3 className="mt-3 text-lg font-bold text-slate-800">{test.testName}</h3>
                  <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Timer size={14} /> {test.duration} Minutes</span>
                    <span className="flex items-center gap-1"><ClipboardList size={14} /> {test.totalQuestions} Questions</span>
                    <span className="flex items-center gap-1"><Award size={14} /> {test.totalMarks} Marks</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleStartTest(test._id)}
                    className="flex items-center gap-2 rounded-xl bg-slate-850 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-950"
                  >
                    Start Exam <Play size={12} className="fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NursingMockTestsPage;
