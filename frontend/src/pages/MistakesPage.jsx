import React, { useEffect, useState } from 'react';
import { BookMarked, CheckCircle2, RefreshCw, Target, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { mistakesAPI } from '../services/api';

const MistakesPage = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');

  const load = () => {
    setLoading(true);
    mistakesAPI.getMistakes({ status })
      .then((response) => setMistakes(response.data || []))
      .catch((error) => toast.error(error.message || 'Could not load your mistake notebook.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const markRevised = async (id) => {
    try {
      await mistakesAPI.updateMistake(id, { revisionStatus: 'completed' });
      setMistakes((current) => current.filter((item) => item._id !== id));
      toast.success('Marked as revised.');
    } catch (error) {
      toast.error(error.message || 'Could not update this mistake.');
    }
  };

  return (
    <AppShell
      eyebrow="Personal revision"
      title="Mistake notebook"
      actions={<button className="shell-action-button" onClick={load}><RefreshCw size={16} /> Refresh</button>}
    >
      <section className="attempts-intro">
        <div>
          <p className="student-eyebrow">Wrong answers become revision material</p>
          <h2>Fix the pattern, not just the answer.</h2>
          <p>Every incorrect response is saved here with its correct answer and explanation.</p>
        </div>
        <div className="attempt-total"><BookMarked size={21} /><strong>{mistakes.length}</strong><span>items shown</span></div>
      </section>

      <div className="mistake-filters">
        {['pending', 'completed', 'all'].map((item) => (
          <button className={status === item ? 'is-active' : ''} onClick={() => setStatus(item)} key={item}>{item}</button>
        ))}
      </div>

      {loading ? <div className="chalk-card workspace-loading"><div className="loader" /><span>Opening notebook…</span></div> : (
        <section className="mistake-list">
          {mistakes.map((mistake, index) => (
            <article className="chalk-card mistake-card" key={mistake._id}>
              <div className="mistake-heading">
                <span>#{index + 1}</span>
                <div><strong>{mistake.questionDetails?.chapter}</strong><small>{mistake.questionDetails?.subject} · {mistake.questionDetails?.topic || 'General'}</small></div>
                <em>{mistake.priority}</em>
              </div>
              <h2 style={{ whiteSpace: 'pre-wrap' }}>{mistake.questionDetails?.questionText}</h2>
              <div className="answer-comparison">
                <div><XCircle size={17} /><span><small>Your answer</small><strong>{mistake.studentResponse?.selectedOption}</strong></span></div>
                <div><CheckCircle2 size={17} /><span><small>Correct answer</small><strong>{mistake.correctAnswer?.option}</strong></span></div>
              </div>
              {mistake.correctAnswer?.explanation && <p className="mistake-explanation">{mistake.correctAnswer.explanation}</p>}
              {mistake.revisionStatus !== 'completed' && <button className="report-primary-button" onClick={() => markRevised(mistake._id)}><Target size={16} /> Mark revised</button>}
            </article>
          ))}
          {!mistakes.length && <div className="chalk-card workspace-empty"><div><CheckCircle2 size={28} /></div><h2>Nothing in this view</h2><p>Incorrect questions will be added automatically after test submission.</p></div>}
        </section>
      )}
    </AppShell>
  );
};

export default MistakesPage;
