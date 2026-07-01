import React from 'react';
import { Clock3, Maximize2, Send } from 'lucide-react';

const ExamHeader = ({
  timeRemaining,
  totalQuestions,
  onSubmit,
  onFullscreen,
  isLowTime,
  isCriticalTime,
}) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');

  return (
    <header className="nta-header">
      <div className="nta-header-main">
        <div className="nta-exam-identity">
          <div className="nta-logo-mark">S</div>
          <div>
            <strong>NEET (UG) Mock Examination</strong>
            <span>{totalQuestions} Questions | +4 correct | -1 incorrect</span>
          </div>
        </div>
        <div className="nta-header-actions">
          <div className={`nta-timer ${isLowTime ? 'is-low' : ''} ${isCriticalTime ? 'is-critical' : ''}`}>
            <Clock3 size={20} />
            <div>
              <span>Time Left</span>
              <strong>{formattedTime}</strong>
            </div>
          </div>
          {onFullscreen && (
            <button type="button" className="nta-fullscreen-button" onClick={onFullscreen}>
              <Maximize2 size={15} /> Fullscreen
            </button>
          )}
          <button type="button" className="nta-submit-button" onClick={onSubmit}>
            <Send size={16} /> Submit Test
          </button>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
