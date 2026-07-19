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
    <header className="relative z-10 flex items-center justify-between bg-slate-950 px-4 py-3 text-white shadow-xl sm:px-6">
      <div className="flex items-center gap-4">
        <div className="text-xl font-black tracking-tight text-white">Medical <span className="text-cyan-300">Mania</span></div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold">NEET (UG) CBT Mock Test</div>
          <div className="text-xs text-slate-400">{totalQuestions} Questions · +4 correct · −1 incorrect</div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-400">Time left</span>
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
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-500"
          onClick={onSubmit}
        >
          <AlertCircle size={16} /> Submit
        </button>
      </div>
    </header>
  );
};

export default ExamHeader;
