import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, ClipboardList, Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { testsAPI } from '../services/api';

const AttemptsPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    testsAPI.getUserAttempts()
      .then((response) => {
        if (active) setAttempts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => toast.error(error.message || 'Failed to load attempts.'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      eyebrow="Performance"
      title="Test attempts"
      actions={
        <button className="shell-action-button" onClick={() => navigate('/dashboard')}>
          <Plus size={16} />
          New test
        </button>
      }
    >
      <section className="attempts-intro">
        <div>
          <p className="student-eyebrow">Your test archive</p>
          <h2>Every paper leaves a useful trail.</h2>
          <p>Open a completed attempt to revisit the score, accuracy, and areas that need another pass.</p>
        </div>
        <div className="attempt-total">
          <ClipboardList size={21} />
          <strong>{attempts.length}</strong>
          <span>attempts saved</span>
        </div>
      </section>

      <section className="chalk-card attempts-panel">
        {loading ? (
          <div className="workspace-loading">
            <div className="loader" />
            <span>Loading your attempts…</span>
          </div>
        ) : attempts.length === 0 ? (
          <div className="workspace-empty">
            <div><Target size={28} /></div>
            <h2>No attempts yet</h2>
            <p>Generate your first test from the dashboard. Your result will appear here after submission.</p>
            <button className="report-primary-button" onClick={() => navigate('/dashboard')}>
              Build a test <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <div className="attempt-list">
            {attempts.map((attempt) => {
              const completed = attempt.status === 'completed' || attempt.status === 'submitted';
              return (
                <button
                  key={attempt._id}
                  type="button"
                  className="attempt-row"
                  onClick={() => completed
                    ? navigate(`/results/${attempt._id}`)
                    : navigate(`/exam/${attempt.test?._id || attempt.test}`)}
                >
                  <div className="attempt-row-icon"><ClipboardList size={20} /></div>
                  <div className="attempt-row-copy">
                    <div>
                      <h3>{attempt.test?.testName || 'Practice test'}</h3>
                      <span className={`attempt-status ${completed ? 'is-complete' : ''}`}>
                        {completed ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    <p>
                      <span><CalendarDays size={14} /> {new Date(attempt.createdAt).toLocaleDateString()}</span>
                      <span>{attempt.test?.testType?.replace(/_/g, ' ') || 'custom test'}</span>
                    </p>
                  </div>
                  <div className="attempt-score">
                    <strong>{completed ? (attempt.score ?? 0) : '—'}</strong>
                    <span>{completed ? `of ${attempt.maxScore || 720}` : 'Resume'}</span>
                  </div>
                  <ArrowRight className="attempt-arrow" size={18} />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default AttemptsPage;
