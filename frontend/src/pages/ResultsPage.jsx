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
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const ResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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
      { label: 'Correct', value: result.questionsCorrect ?? 0, icon: CheckCircle2, tone: 'green' },
      { label: 'Incorrect', value: result.questionsWrong ?? 0, icon: XCircle, tone: 'red' },
      { label: 'Skipped', value: result.questionsSkipped ?? 0, icon: MinusCircle, tone: 'muted' },
      { label: 'Negative marks', value: result.negativeMarks ?? 0, icon: AlertTriangle, tone: 'red' },
      { label: 'Avg. time', value: `${Math.round(Number(result.averageTimePerQuestion) || 0)}s`, icon: Clock3, tone: 'cyan' },
    ];
  }, [result]);

  if (loading) {
    return (
      <AppShell eyebrow="Performance" title="Result report">
        <div className="chalk-card workspace-loading">
          <div className="loader" />
          <span>Preparing your report…</span>
        </div>
      </AppShell>
    );
  }

  if (!result) {
    return (
      <AppShell eyebrow="Performance" title="Result unavailable">
        <div className="chalk-card workspace-empty">
          <div><AlertTriangle size={28} /></div>
          <h2>We could not open this report</h2>
          <p>The attempt may still be in progress, or it may no longer be available.</p>
          <button className="report-primary-button" onClick={() => navigate('/attempts')}>Back to attempts</button>
        </div>
      </AppShell>
    );
  }

  const accuracy = Math.max(0, Math.min(100, Number(result.accuracy) || 0));
  const scorePercent = result.maxScore ? Math.max(0, (result.score / result.maxScore) * 100) : 0;

  return (
    <AppShell
      eyebrow="Performance"
      title="Result report"
      actions={
        <button className="shell-action-button" onClick={() => window.print()}>
          <Download size={16} />
          Print scorecard
        </button>
      }
    >
      <button className="report-back" onClick={() => navigate('/attempts')}>
        <ArrowLeft size={16} /> Back to attempts
      </button>

      <section className="result-hero">
        <div className="result-score-ring" style={{ '--score-progress': `${scorePercent * 3.6}deg` }}>
          <div>
            <strong>{result.score ?? 0}</strong>
            <span>of {result.maxScore ?? 0}</span>
          </div>
        </div>
        <div className="result-hero-copy">
          <p className="student-eyebrow">Test complete</p>
          <h2>{accuracy >= 75 ? 'Strong work. Keep the edge.' : accuracy >= 50 ? 'A useful baseline.' : 'Now we know what to fix.'}</h2>
          <p>Your score is saved. Use the accuracy and timing below to choose the next focused revision block.</p>
          <div className="result-badges">
            <span><Trophy size={15} /> {accuracy.toFixed(1)}% accuracy</span>
            {result.rankPrediction && <span><Target size={15} /> Predicted rank: {result.rankPrediction}</span>}
          </div>
        </div>
      </section>

      <section className="result-stat-grid">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div className={`result-stat tone-${tone}`} key={label}>
            <Icon size={20} />
            <div><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
      </section>

      <section className="result-details-grid">
        <div className="chalk-card accuracy-card">
          <div className="section-heading">
            <div>
              <p className="student-eyebrow">Attempt quality</p>
              <h2>Accuracy</h2>
            </div>
            <strong>{accuracy.toFixed(1)}%</strong>
          </div>
          <div className="accuracy-track"><span style={{ width: `${accuracy}%` }} /></div>
          <p>{result.questionsAttempted ?? 0} questions attempted in this test.</p>
        </div>

        <div className="chalk-card analysis-summary">
          <p className="student-eyebrow">Study recommendation</p>
          <h2>What to do next</h2>
          <p>{result.analysis || 'Review the questions you missed, note the concept behind each error, and take a shorter focused test next.'}</p>
          <button className="report-primary-button" onClick={() => navigate('/dashboard')}>
            Build the next test
          </button>
        </div>
      </section>

      {result.subjectAnalysis && (
        <section className="chalk-card subject-report">
          <div className="section-heading">
            <div><p className="student-eyebrow">Subject breakdown</p><h2>Where the marks came from</h2></div>
          </div>
          <div className="subject-report-grid">
            {Object.entries(result.subjectAnalysis)
              .filter(([, data]) => data && (data.attempted || data.skipped))
              .map(([subject, data]) => (
                <div className="subject-report-card" key={subject}>
                  <div><strong>{subject}</strong><span>{Number(data.accuracy || 0).toFixed(1)}% accuracy</span></div>
                  <b>{data.score ?? 0}</b>
                  <p>{data.correct || 0} correct · {data.wrong || 0} wrong · {data.skipped || 0} skipped</p>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="result-area-grid">
        <div className="chalk-card result-area-card">
          <p className="student-eyebrow">Revise next</p>
          <h2>Weak chapters</h2>
          <div>{result.weakAreas?.length ? result.weakAreas.map((area) => <span key={area}>{area}</span>) : <p>No weak chapter identified yet.</p>}</div>
        </div>
        <div className="chalk-card result-area-card is-strong">
          <p className="student-eyebrow">Keep warm</p>
          <h2>Strong chapters</h2>
          <div>{result.strongAreas?.length ? result.strongAreas.map((area) => <span key={area}>{area}</span>) : <p>Complete more questions to identify strengths.</p>}</div>
        </div>
      </section>
    </AppShell>
  );
};

export default ResultsPage;
