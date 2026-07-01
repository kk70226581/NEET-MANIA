import React from 'react';

const QuestionPalette = ({
  questions,
  currentIndex,
  responses,
  markedForReview = {},
  visitedQuestions = new Set(),
  onSelectQuestion,
}) => {
  const getStatus = (question) => {
    const id = String(question._id);
    const response = responses[id];
    if (markedForReview[id] && response?.selectedOption) return 'answered_marked';
    if (markedForReview[id]) return 'marked';
    if (response?.selectedOption) return 'answered';
    if (visitedQuestions.has(id)) return 'not_answered';
    return 'not_visited';
  };

  const counts = questions.reduce((summary, question) => {
    const status = getStatus(question);
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});

  const legend = [
    ['answered', 'Answered', counts.answered || 0],
    ['not_answered', 'Not Answered', counts.not_answered || 0],
    ['not_visited', 'Not Visited', counts.not_visited || 0],
    ['marked', 'Marked for Review', counts.marked || 0],
    ['answered_marked', 'Answered & Marked', counts.answered_marked || 0],
  ];

  return (
    <div className="nta-palette-panel">
      <div className="nta-candidate-card">
        <div className="nta-candidate-avatar">S</div>
        <div><strong>Candidate</strong></div>
      </div>

      <div className="nta-palette-title">
        <strong>Question Palette</strong>
      </div>

      <div className="nta-palette-grid">
        {questions.map((question, index) => {
          const status = getStatus(question);
          return (
            <button
              type="button"
              key={question._id}
              onClick={() => onSelectQuestion(index)}
              className={`nta-palette-number status-${status} ${index === currentIndex ? 'is-current' : ''}`}
              aria-label={`Question ${index + 1}, ${status.replace(/_/g, ' ')}`}
            >
              {index + 1}
              {status === 'answered_marked' && <i />}
            </button>
          );
        })}
      </div>

      <div className="nta-palette-legend">
        {legend.map(([status, label, count]) => (
          <div key={status}>
            <span className={`nta-legend-shape status-${status}`}>{count}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <div className="nta-palette-note">
        Answered and marked questions are considered for evaluation.
      </div>
    </div>
  );
};

export default QuestionPalette;
