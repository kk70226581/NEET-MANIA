import React from 'react';
import { Clock, Maximize, AlertCircle } from 'lucide-react';

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
    <header className="bg-[#1a4b8c] text-white flex justify-between items-center px-4 py-2 shadow-md z-10 relative">
      <div className="flex items-center gap-4">
        <div className="text-xl font-black tracking-wider uppercase text-yellow-400">Solnut NEET</div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold">NEET (UG) CBT Mock Test</div>
          <div className="text-xs text-blue-200">{totalQuestions} Questions | +4 for correct, -1 for incorrect</div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-blue-200">Time Left</span>
          <div className={`flex items-center gap-2 font-bold font-mono text-xl tracking-wider ${isCriticalTime ? 'text-red-400 animate-pulse' : isLowTime ? 'text-orange-300' : 'text-white'}`}>
            <Clock size={18} className={isCriticalTime ? 'animate-bounce' : ''} />
            {formattedTime}
          </div>
        </div>
        
        {onFullscreen && (
          <button 
            type="button" 
            className="flex flex-col items-center justify-center p-1 hover:text-yellow-300 transition-colors" 
            onClick={onFullscreen}
            title="Toggle Fullscreen"
          >
            <Maximize size={18} />
            <span className="text-[10px] uppercase font-bold mt-1">Screen</span>
          </button>
        )}
        
        <button 
          type="button" 
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded shadow-sm flex items-center gap-2 transition-colors border border-red-800" 
          onClick={onSubmit}
        >
          <AlertCircle size={16} /> Submit
        </button>
      </div>
    </header>
  );
};

export default ExamHeader;
