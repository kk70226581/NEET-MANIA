import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const PerformancePage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    testsAPI.getUserAttempts({ limit: 50 })
      .then((response) => setAttempts((response.data || []).filter((item) => ['submitted', 'completed'].includes(item.status))))
      .catch((error) => toast.error(error.message || 'Could not load performance data.'))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const count = attempts.length;
    const average = count ? Math.round(attempts.reduce((sum, item) => sum + ((item.score || 0) / (item.maxScore || 720)) * 100, 0) / count) : 0;
    const best = count ? Math.max(...attempts.map((item) => item.score || 0)) : 0;
    const questions = attempts.reduce((sum, item) => sum + (item.analysis?.totalQuestionsAttempted || 0), 0);
    return { count, average, best, questions };
  }, [attempts]);

  return (
    <AppShell eyebrow="Learning analytics" title="Performance">
      <section className="product-hero compact"><div><span className="product-badge"><BarChart3 size={15} /> Progress centre</span><h2>See what is improving—and what is costing marks.</h2><p>Your reports use actual responses, time spent, and negative marking from completed tests.</p></div></section>
      <section className="performance-kpis">
        {[['Tests completed', summary.count, ClipboardList, 'cyan'], ['Average score', `${summary.average}%`, TrendingUp, 'green'], ['Best score', summary.best, Target, 'yellow'], ['Questions solved', summary.questions, CheckCircle2, 'pink']].map(([label, value, Icon, tone]) => (
          <div className={`performance-kpi tone-${tone}`} key={label}><span><Icon size={20} /></span><div><strong>{value}</strong><small>{label}</small></div></div>
        ))}
      </section>
      <section className="chalk-card performance-panel">
        <div className="section-heading"><div><p className="student-eyebrow">Score history</p><h2>Recent test performance</h2></div></div>
        {loading ? <div className="workspace-loading"><div className="loader" /><span>Calculating performance…</span></div> : attempts.length ? (
          <div className="performance-table">
            <div className="performance-table-head"><span>Test</span><span>Score</span><span>Accuracy</span><span>Date</span><span></span></div>
            {attempts.map((attempt) => (
              <button key={attempt._id} onClick={() => navigate(`/results/${attempt._id}`)}><span><strong>{attempt.test?.testName || 'Practice test'}</strong><small>{attempt.test?.testType?.replace(/_/g, ' ')}</small></span><b>{attempt.score}/{attempt.maxScore || 720}</b><em>{Number(attempt.analysis?.accuracy || 0).toFixed(1)}%</em><time>{new Date(attempt.createdAt).toLocaleDateString()}</time><ArrowRight size={16} /></button>
            ))}
          </div>
        ) : <div className="workspace-empty"><div><BarChart3 size={28} /></div><h2>No performance data yet</h2><p>Complete your first test to unlock score trends and accuracy analysis.</p><button className="report-primary-button" onClick={() => navigate('/tests')}>Take a test</button></div>}
      </section>
    </AppShell>
  );
};

export default PerformancePage;
