import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  Clock3,
  Copy,
  Cpu,
  Database,
  Gauge,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatUptime = (seconds) => {
  const hours = Math.floor(Number(seconds || 0) / 3600);
  const minutes = Math.floor((Number(seconds || 0) % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'students' | 'security'
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Testing state
  const [testPrompt, setTestPrompt] = useState('Explain the difference between Mitosis and Meiosis in 20 words for a NEET student.');
  const [testingAI, setTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);

  // Student list state
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getOverview();
      setOverview(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Could not load platform overview.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (query = '') => {
    setLoadingStudents(true);
    try {
      const response = await adminAPI.getStudents({ search: query, limit: 15 });
      setStudents(response.data?.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    }
  }, [activeTab]);

  const handleTestAI = async (customPrompt) => {
    const promptToSend = customPrompt || testPrompt;
    if (!promptToSend.trim() || testingAI) return;
    setTestingAI(true);
    setAiTestResult(null);

    try {
      const response = await adminAPI.testAiConnection(promptToSend);
      setAiTestResult(response.data);
      if (response.data?.success) {
        toast.success(`AI Response received in ${response.data.latencyMs}ms!`);
      } else {
        toast.error('AI test returned an error: ' + (response.data?.error || 'Check credentials'));
      }
    } catch (testError) {
      setAiTestResult({
        success: false,
        error: testError.message || 'Failed to communicate with AI server route.',
        diagnosis: 'Network error or unhandled backend exception.',
        suggestion: 'Verify backend deployment status on Render.'
      });
      toast.error('AI test execution failed.');
    } finally {
      setTestingAI(false);
    }
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const metrics = overview?.metrics || {};
  const aiInfo = overview?.ai || {};
  const service = overview?.service || {};
  const systemHealthy = service?.api === 'operational' && service?.database === 'connected';

  return (
    <AppShell hideSearch>
      <main className="mx-auto w-full max-w-[1540px] space-y-7 p-4 pb-28 md:p-8">
        {/* Top Command Banner */}
        <section className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-10 border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,.24),transparent_35%),radial-gradient(circle_at_15%_100%,rgba(16,185,129,.22),transparent_35%)]" />
          
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
                  <ShieldCheck size={14} /> OWNER CONTROL CENTRE
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300">
                  <Cpu size={14} /> AI ENGINE: {aiInfo?.provider ? aiInfo.provider.toUpperCase() : 'BEDROCK'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-300">
                  <Server size={14} /> RENDER CLOUD
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Medical Mania <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Admin Hub</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Manage your AWS Bedrock AI chatbot, question bank curation, active learners, and server credentials in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-bold backdrop-blur-md ${systemHealthy ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-400/30 bg-amber-500/10 text-amber-200'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${systemHealthy ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-amber-400'}`} />
                {systemHealthy ? 'Systems Operational' : 'Action Required'}
              </span>

              <button
                type="button"
                onClick={loadOverview}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md transition hover:bg-slate-100 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="relative mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-6">
            {[
              { id: 'overview', label: 'Platform Overview', icon: Gauge },
              { id: 'ai', label: 'AWS Bedrock & AI Chatbot', icon: Bot, badge: aiInfo?.isConfigured ? 'Ready' : 'Setup' },
              { id: 'students', label: 'Learner Accounts', icon: Users },
              { id: 'security', label: 'Admin Credentials & Security', icon: KeyRound },
            ].map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold transition ${
                  activeTab === id
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    activeTab === id ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <strong className="block font-bold">Dashboard Warning:</strong>
              {error}
            </div>
          </section>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
              {/* Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Registered Students',
                    value: formatNumber(metrics.totalStudents),
                    note: `+${formatNumber(metrics.newStudents)} registered this week`,
                    icon: Users,
                    tone: 'from-blue-600 to-cyan-500',
                    badge: `${formatNumber(metrics.activeStudents)} active`,
                  },
                  {
                    label: 'Question Bank',
                    value: formatNumber(metrics.totalQuestions),
                    note: `${formatNumber(metrics.publishedQuestions)} published · ${formatNumber(metrics.pendingQuestions)} pending`,
                    icon: BookOpenCheck,
                    tone: 'from-violet-600 to-indigo-500',
                    badge: `${formatNumber(metrics.aiGeneratedQuestions || 0)} AI curated`,
                  },
                  {
                    label: 'Exam Attempts',
                    value: formatNumber(metrics.totalAttempts),
                    note: `${formatNumber(metrics.recentAttempts)} attempts in last 7 days`,
                    icon: Activity,
                    tone: 'from-orange-500 to-amber-400',
                    badge: `${formatNumber(metrics.publishedTests)} tests active`,
                  },
                  {
                    label: 'AI Mentor Status',
                    value: aiInfo?.isConfigured ? 'Online' : 'Pending',
                    note: `Model: ${aiInfo?.model || 'amazon.nova-lite-v1:0'}`,
                    icon: Bot,
                    tone: aiInfo?.isConfigured ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-orange-400',
                    badge: aiInfo?.provider?.toUpperCase() || 'BEDROCK',
                  },
                ].map(({ label, value, note, icon: Icon, tone, badge }) => (
                  <motion.article
                    key={label}
                    whileHover={{ y: -4 }}
                    className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ${tone}`}>
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {badge}
                      </span>
                    </div>

                    <strong className="mt-5 block text-3xl font-black tracking-tight text-slate-900">
                      {loading ? '—' : value}
                    </strong>
                    <span className="mt-1 block text-sm font-extrabold text-slate-700">{label}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-400">
                      {loading ? 'Syncing...' : note}
                    </span>
                  </motion.article>
                ))}
              </div>

              {/* Main Content Grid: Question Distribution & System Health */}
              <div className="grid gap-6 xl:grid-cols-5">
                {/* Question Bank Coverage */}
                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">Syllabus Balance</span>
                      <h2 className="mt-1 text-xl font-black text-slate-900">Question Bank by Subject</h2>
                      <p className="mt-1 text-sm text-slate-500">Distribution of published practice questions across NEET modules.</p>
                    </div>
                    <Database className="text-violet-500" size={24} />
                  </div>

                  <div className="mt-7 space-y-4">
                    {(overview?.subjectDistribution || []).length ? (
                      overview.subjectDistribution.map(({ subject, count }) => {
                        const total = Math.max(metrics.totalQuestions || 1, 1);
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={subject}>
                            <div className="mb-1.5 flex justify-between gap-3 text-sm">
                              <span className="font-bold capitalize text-slate-800">{subject}</span>
                              <span className="font-semibold text-slate-500">{formatNumber(count)} questions ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500 text-center">
                        No subject distribution data found.
                      </div>
                    )}
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
                      <strong className="mt-1 block text-2xl font-black text-amber-900">{formatNumber(metrics.pendingQuestions)}</strong>
                      <span className="text-xs text-amber-700">Questions awaiting admin review or publication</span>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active Tests</span>
                      <strong className="mt-1 block text-2xl font-black text-emerald-900">{formatNumber(metrics.publishedTests)}</strong>
                      <span className="text-xs text-emerald-700">Full CBT test sets available to students</span>
                    </div>
                  </div>
                </article>

                {/* Cloud & Render Service Status */}
                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Runtime Telemetry</span>
                      <h2 className="mt-1 text-xl font-black text-slate-900">Platform Health</h2>
                    </div>
                    <Gauge className="text-blue-500" size={24} />
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      ['API Service', service.api, 'text-emerald-600'],
                      ['MongoDB Database', service.database, service.database === 'connected' ? 'text-emerald-600' : 'text-amber-600'],
                      ['AI Chatbot Gateway', aiInfo?.isConfigured ? 'Configured' : 'Credentials Needed', aiInfo?.isConfigured ? 'text-emerald-600' : 'text-amber-600'],
                    ].map(([label, val, color]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 border border-slate-100">
                        <span className="text-sm font-bold text-slate-700">{label}</span>
                        <span className={`inline-flex items-center gap-2 text-xs font-extrabold capitalize ${color}`}>
                          <span className={`h-2 w-2 rounded-full ${color.includes('emerald') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {val || 'Checking'}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">Server Uptime</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Clock3 size={13} /> {loading ? '—' : formatUptime(service.uptimeSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">Node Memory (RSS)</span>
                      <span className="text-xs font-bold text-slate-600">
                        {service.memoryMb ? `${service.memoryMb} MB` : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {/* Company & Support info */}
                  <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                      <Globe2 size={16} /> {overview?.company?.name || 'Medical Mania'}
                    </div>
                    <a
                      className="mt-1 block truncate text-xs font-medium text-indigo-600 hover:underline"
                      href={overview?.company?.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {overview?.company?.website || 'https://medicalmania.site'}
                    </a>
                    <p className="mt-2 text-xs text-indigo-800">
                      Support: {overview?.company?.supportEmail || 'admin@medicalmania.site'}
                    </p>
                  </div>
                </article>
              </div>

              {/* Bottom Quick Actions & Recent Students */}
              <div className="grid gap-6 xl:grid-cols-5">
                {/* Recent Students */}
                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">Growth</span>
                      <h2 className="mt-1 text-xl font-black text-slate-900">Recent Registrations</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      View All <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="mt-5 divide-y divide-slate-100">
                    {(overview?.recentStudents || []).length ? (
                      overview.recentStudents.map((student) => (
                        <div key={student._id} className="flex items-center gap-3.5 py-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">
                            {`${student.firstName?.[0] || 'S'}${student.lastName?.[0] || ''}`}
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong className="block truncate text-sm font-bold text-slate-800">
                              {student.firstName} {student.lastName}
                            </strong>
                            <span className="block truncate text-xs text-slate-400">{student.email}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs font-bold text-slate-700">
                              {student.attemptCount || 0} tests
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {new Date(student.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-sm text-slate-500">
                        New learner accounts will appear here.
                      </div>
                    )}
                  </div>
                </article>

                {/* Shortcuts */}
                <article className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 p-6 text-white shadow-xl xl:col-span-2">
                  <Sparkles size={26} className="text-indigo-200" />
                  <h2 className="mt-4 text-2xl font-black">Admin Command</h2>
                  <p className="mt-2 text-sm leading-6 text-indigo-100">
                    Quickly jump into content verification, AI chatbot testing, and question reviews.
                  </p>

                  <div className="mt-6 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ai')}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3.5 text-left text-sm font-bold backdrop-blur-md transition hover:bg-white/25"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Bot size={18} /> Test Bedrock AI Chatbot
                      </span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/admin/questions')}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3.5 text-left text-sm font-bold backdrop-blur-md transition hover:bg-white/25"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <BookOpenCheck size={18} /> Review Question Bank
                      </span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/admin/pyq')}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3.5 text-left text-sm font-bold backdrop-blur-md transition hover:bg-white/25"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Layers size={18} /> Manage PYQ Quality
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* TAB 2: AI ENGINE & BEDROCK DIAGNOSTICS */}
        {activeTab === 'ai' && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
              {/* Status Header */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[.16em] text-cyan-600">AI Intelligence Core</span>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">AWS Bedrock Chatbot Diagnostics</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your NEET Bhaiya mentor chatbot is powered by AWS Bedrock using the official Converse API.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${
                      aiInfo?.isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${aiInfo?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {aiInfo?.isConfigured ? 'Bedrock Engine Online' : 'Credentials Missing in Render'}
                    </span>
                  </div>
                </div>

                {/* Configuration checklist */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: 'AI Provider',
                      value: aiInfo?.provider || 'bedrock',
                      status: true,
                      sub: 'Configured in backend/.env',
                    },
                    {
                      label: 'Bedrock Model ID',
                      value: aiInfo?.model || 'amazon.nova-lite-v1:0',
                      status: true,
                      sub: 'AWS Bedrock model',
                    },
                    {
                      label: 'AWS Access Key',
                      value: aiInfo?.credentials?.hasAwsAccessKey ? 'Present (Configured)' : 'Missing on Server',
                      status: aiInfo?.credentials?.hasAwsAccessKey,
                      sub: 'AWS_ACCESS_KEY_ID',
                    },
                    {
                      label: 'AWS Secret Key',
                      value: aiInfo?.credentials?.hasAwsSecretKey ? 'Present (Configured)' : 'Missing on Server',
                      status: aiInfo?.credentials?.hasAwsSecretKey,
                      sub: 'AWS_SECRET_ACCESS_KEY',
                    },
                  ].map(({ label, value, status, sub }) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">{label}</span>
                        {status ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500" />
                        )}
                      </div>
                      <strong className="mt-2 block truncate text-sm font-bold text-slate-900">{value}</strong>
                      <span className="block text-[11px] text-slate-400">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive AI Playground */}
              <div className="grid gap-6 xl:grid-cols-5">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">Real-Time Testing</span>
                      <h3 className="mt-1 text-xl font-black text-slate-900">Interactive Bedrock Tester</h3>
                    </div>
                    <Zap className="text-violet-500" size={22} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Send a test prompt directly to AWS Bedrock to verify live connectivity, latency, and model responses.
                  </p>

                  <div className="mt-5 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Test Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      placeholder="Type any NEET doubt or prompt to test..."
                      className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-400">Quick tests:</span>
                      {[
                        'Explain Bohr Atomic Model in 25 words.',
                        'What is the formula of Osmotic Pressure?',
                        'Give a motivation tip for NEET dropper.'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setTestPrompt(preset);
                            handleTestAI(preset);
                          }}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {preset.slice(0, 32)}...
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestAI()}
                      disabled={testingAI || !testPrompt.trim()}
                      className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {testingAI ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" /> Querying Bedrock...
                        </>
                      ) : (
                        <>
                          <Play size={16} /> Run Bedrock AI Test
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Response Output */}
                  {aiTestResult && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <Terminal size={14} />
                          {aiTestResult.success ? 'Success (200 OK)' : 'Error Encountered'}
                        </span>
                        {aiTestResult.latencyMs && (
                          <span className="text-xs font-mono text-slate-400">
                            Latency: {aiTestResult.latencyMs}ms
                          </span>
                        )}
                      </div>

                      {aiTestResult.success ? (
                        <div className="mt-4 space-y-2">
                          <div className="text-xs font-mono text-cyan-300">
                            Model: {aiTestResult.model} ({aiTestResult.provider})
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                            {aiTestResult.reply}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2 text-sm">
                          <p className="font-semibold text-rose-400">
                            Error: {aiTestResult.error}
                          </p>
                          {aiTestResult.diagnosis && (
                            <p className="text-xs text-amber-300">
                              <b>Diagnosis:</b> {aiTestResult.diagnosis}
                            </p>
                          )}
                          {aiTestResult.suggestion && (
                            <p className="text-xs text-slate-300">
                              <b>Fix:</b> {aiTestResult.suggestion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Render Configuration Helper */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">Deployment Guide</span>
                      <h3 className="mt-1 text-xl font-black text-slate-900">How to Fix on Render</h3>
                    </div>
                    <Server className="text-emerald-500" size={22} />
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    To make AWS Bedrock work in your Render backend deployment, add these environment variables in your <b>Render Service Dashboard → Environment</b>:
                  </p>

                  <div className="relative mt-4 rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `AI_PROVIDER=bedrock\nAWS_ACCESS_KEY_ID=your_key_here\nAWS_SECRET_ACCESS_KEY=your_secret_here\nAWS_REGION=us-east-1\nBEDROCK_MODEL_ID=amazon.nova-lite-v1:0`
                        )
                      }
                      className="absolute top-3 right-3 rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20"
                      title="Copy template"
                    >
                      <Copy size={14} />
                    </button>
                    <pre className="text-[11px] leading-5">
{`# Required for AWS Bedrock
AI_PROVIDER=bedrock
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0`}
                    </pre>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-900">1.</span>
                      <span>Ensure your AWS IAM user has <code>AmazonBedrockFullAccess</code> permissions.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-900">2.</span>
                      <span>In AWS Bedrock Console → <b>Model Access</b>, enable <b>Amazon Nova Lite</b> or <b>Claude</b>.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-900">3.</span>
                      <span>Our system now includes automatic fallback so the chatbot never crashes even if AWS is reconnecting!</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* TAB 3: LEARNERS & ACCOUNTS */}
        {activeTab === 'students' && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">User Management</span>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Learner Directory</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Search and monitor student accounts, test attempt history, and platform engagement.
                    </p>
                  </div>

                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        loadStudents(e.target.value);
                      }}
                      placeholder="Search by name or email..."
                      className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="rounded-l-xl px-4 py-3.5">Student</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Tests Completed</th>
                        <th className="px-4 py-3.5">Joined Date</th>
                        <th className="rounded-r-xl px-4 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingStudents ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            <RefreshCw className="mx-auto animate-spin" size={20} />
                            <span className="mt-2 block text-xs">Loading students...</span>
                          </td>
                        </tr>
                      ) : students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student._id} className="transition hover:bg-slate-50/50">
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-3">
                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-xs font-black text-blue-800">
                                  {`${student.firstName?.[0] || 'S'}${student.lastName?.[0] || ''}`}
                                </span>
                                <span>{student.firstName} {student.lastName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">{student.email}</td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                <Activity size={12} /> {student.attemptCount || 0} attempts
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500">
                              {new Date(student.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                student.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {student.isActive !== false ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No students found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* TAB 4: ADMIN CREDENTIALS & SECURITY */}
        {activeTab === 'security' && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">Access & Authentication</span>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Admin Email & Password Configuration</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      How owner authentication works in Medical Mania, and how your credentials are secure.
                    </p>
                  </div>
                  <Lock className="text-emerald-500" size={24} />
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound size={18} className="text-indigo-600" />
                      Where are Admin Credentials Stored?
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      In accordance with modern web security best practices, admin credentials are <b>never hardcoded</b> in the repository. Instead, they are defined via server environment variables:
                    </p>

                    <div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-xs font-mono border border-slate-200">
                      <div>
                        <span className="text-slate-400"># Admin Email:</span>
                        <div className="font-bold text-indigo-700">ADMIN_EMAIL=owner@medicalmania.site</div>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400"># Admin Password:</span>
                        <div className="font-bold text-indigo-700">ADMIN_PASSWORD=your_secure_password</div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      <b>Current Server Config:</b> {overview?.company?.configuredAdminEmail || 'Configured via ADMIN_EMAIL'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      How to Set or Change on Render
                    </h3>
                    <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-600 list-decimal pl-4">
                      <li>
                        Log in to your <b>Render Dashboard</b> (<a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">dashboard.render.com</a>).
                      </li>
                      <li>
                        Select your <b>Backend Web Service</b> (e.g. <code>solnut-neet-backend</code>).
                      </li>
                      <li>
                        Click the <b>Environment</b> tab on the left menu.
                      </li>
                      <li>
                        Add or update:
                        <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-slate-800">
                          <li><code>ADMIN_EMAIL</code>: your email address</li>
                          <li><code>ADMIN_PASSWORD</code>: a strong unique password</li>
                        </ul>
                      </li>
                      <li>
                        Click <b>Save Changes</b>. Render will reload your backend with the new credentials immediately!
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle size={15} /> Security Rule
                  </p>
                  <p className="mt-1">
                    If <code>ADMIN_PASSWORD</code> is missing or left as <code>change_me_in_production</code>, admin login is automatically disabled by the server for security. Always set a unique password on Render.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </AppShell>
  );
}
