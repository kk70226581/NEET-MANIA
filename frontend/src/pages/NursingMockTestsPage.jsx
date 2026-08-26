import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ClipboardList, Play, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { nursingAPI } from '../services/api';

const NursingMockTestsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nursingAPI.getExams().then(response => {
      const list = response.data || [];
      setExams(list);
      if (list[0]) setSelectedExamId(list[0]._id);
    }).catch(error => toast.error(error.message || 'Could not load exams.'));
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    setLoading(true);
    nursingAPI.getMockTests(selectedExamId)
      .then(response => setMockTests(response.data || []))
      .catch(error => toast.error(error.message || 'Could not load mock tests.'))
      .finally(() => setLoading(false));
  }, [selectedExamId]);

  const generate = async () => {
    try {
      const response = await nursingAPI.generateTest({ examId: selectedExamId, phase: 'practice' });
      toast.success('Balanced mock test created from published questions.');
      navigate(`/bsc-nursing/exam/${response.data._id}`);
    } catch (error) { toast.error(error.message || 'Could not generate a mock test.'); }
  };

  return <AppShell><div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Timed CBT</p><h1 className="mt-2 text-3xl font-black text-slate-900">Mock test series</h1><p className="mt-2 text-sm text-slate-500">Only published questions are used; each exam keeps its own duration and marking scheme.</p></div><div className="flex gap-2"><select value={selectedExamId} onChange={event => setSelectedExamId(event.target.value)} className="rounded-xl border bg-white px-3 text-sm">{exams.map(exam => <option key={exam._id} value={exam._id}>{exam.examName}</option>)}</select><button onClick={generate} disabled={!selectedExamId} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Generate custom mock</button></div></div>{loading ? <div className="py-20 text-center text-slate-500">Loading tests…</div> : mockTests.length === 0 ? <div className="rounded-2xl border border-dashed bg-white py-20 text-center text-slate-500">No saved mocks yet. Generate one from the published bank.</div> : <div className="grid gap-5 md:grid-cols-2">{mockTests.map(test => <article key={test._id} className="rounded-2xl border bg-white p-6 shadow-sm"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">{test.testPhase}</span><h2 className="mt-4 text-lg font-bold text-slate-900">{test.testName}</h2><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex gap-1"><Timer size={14}/>{test.duration} min</span><span className="flex gap-1"><ClipboardList size={14}/>{test.totalQuestions} questions</span><span className="flex gap-1"><Award size={14}/>{test.totalMarks} marks</span></div><button onClick={() => navigate(`/bsc-nursing/exam/${test._id}`)} className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Start exam <Play size={14}/></button></article>)}</div>}</div></AppShell>;
};

export default NursingMockTestsPage;
