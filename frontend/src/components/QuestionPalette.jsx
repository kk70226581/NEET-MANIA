import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';

const QuestionPalette = ({
  questions,
  currentIndex,
  responses,
  markedForReview = {},
  visitedQuestions = new Set(),
  onSelectQuestion,
}) => {
  const user = useSelector((state) => state.user.user);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'NEET Aspirant';
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

  // NTA Colors mapped to Tailwind
  const statusStyles = {
    not_visited: 'bg-gray-200 text-gray-800 border-gray-300', // Silver/Grey
    not_answered: 'bg-red-600 text-white rounded-br-xl',     // Red, rounded bottom-right
    answered: 'bg-green-600 text-white rounded-tl-xl',       // Green, rounded top-left
    marked: 'bg-purple-600 text-white rounded-full',         // Purple circle
    answered_marked: 'bg-purple-600 text-white rounded-full relative after:content-[""] after:absolute after:bottom-1 after:right-1 after:w-2 after:h-2 after:bg-green-400 after:rounded-full', // Purple circle with green dot
  };

  const legend = [
    ['not_visited', 'Not Visited', counts.not_visited || 0],
    ['not_answered', 'Not Answered', counts.not_answered || 0],
    ['answered', 'Answered', counts.answered || 0],
    ['marked', 'Marked for Review', counts.marked || 0],
    ['answered_marked', 'Answered & Marked for Review (will be considered for evaluation)', counts.answered_marked || 0],
  ];

  return (
    <div className="flex h-full flex-col border-l border-slate-200 bg-slate-50">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
          <User size={21}/>
        </div>
        <div>
          <div className="text-sm font-black text-slate-800">{name}</div>
          <div className="text-xs font-semibold text-slate-500">NEET (UG) aspirant</div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-700">
          {legend.map(([status, label, count]) => (
            <div key={status} className={`flex items-center gap-2 ${status === 'answered_marked' ? 'col-span-2' : ''}`}>
              <div className={`w-8 h-7 flex items-center justify-center font-bold shadow-sm border ${statusStyles[status]}`}>
                {count}
              </div>
              <span className="leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Palette Title */}
      <div className="bg-slate-900 px-4 py-3 text-sm font-black text-white">
        Question navigator
      </div>

      {/* Palette Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        <div className="grid grid-cols-5 gap-2 gap-y-3">
          {questions.map((question, index) => {
            const status = getStatus(question);
            const isCurrent = index === currentIndex;
            return (
              <button
                type="button"
                key={question._id}
                onClick={() => onSelectQuestion(index)}
                className={`w-10 h-9 flex items-center justify-center font-bold text-sm transition-transform shadow-sm border relative
                  ${statusStyles[status]} 
                  ${isCurrent ? 'ring-2 ring-offset-1 ring-blue-600 scale-110 z-10' : 'hover:opacity-90'}
                `}
                aria-label={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
