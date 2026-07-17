import React, { useEffect, useState } from 'react';

const MatchTableParser = ({ text }) => {
  // Extract A, B, C, D...
  const alphaReg = /([A-E])\.\s+([\s\S]*?)(?=(?:[A-E]\.|I{1,3}\.|IV\.|V\.|List[\s-]*[I]+|Column[\s-]*[I]+|Choose\s*the|$))/gi;
  // Extract I, II, III, IV...
  const romanReg = /(I{1,3}|IV|V)\.\s+([\s\S]*?)(?=(?:[A-E]\.|I{1,3}\.|IV\.|V\.|List[\s-]*[I]+|Column[\s-]*[I]+|Choose\s*the|$))/gi;
  
  const alphas = [];
  const romans = [];
  
  let m;
  while ((m = alphaReg.exec(text))) {
    alphas.push({ id: m[1].toUpperCase(), text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
  }
  while ((m = romanReg.exec(text))) {
    romans.push({ id: m[1].toUpperCase(), text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
  }

  // Fallback to plain text if parsing fails to find pairs
  if (alphas.length === 0 || romans.length === 0) {
    return <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  // Find the prefix (everything before the first matched item)
  const firstMatchIndex = Math.min(
    text.search(/[A-E]\.\s+/i) !== -1 ? text.search(/[A-E]\.\s+/i) : Infinity,
    text.search(/(I{1,3}|IV|V)\.\s+/i) !== -1 ? text.search(/(I{1,3}|IV|V)\.\s+/i) : Infinity
  );
  
  let prefix = '';
  if (firstMatchIndex !== Infinity && firstMatchIndex > 0) {
    prefix = text.substring(0, firstMatchIndex).replace(/(List|Column)[\s-]*[I]+/gi, '').trim();
  }

  // Try to extract the suffix (e.g. Choose the correct answer...)
  let suffix = '';
  const suffixMatch = text.match(/(Choose the correct|Select the correct|Which of the following)/i);
  if (suffixMatch) {
    suffix = text.substring(suffixMatch.index).trim();
    // Also remove this suffix from the last element's text if it got captured
    if (alphas.length > 0) {
      const last = alphas[alphas.length - 1];
      const sIdx = last.text.search(/(Choose the correct|Select the correct|Which of the following)/i);
      if (sIdx !== -1) last.text = last.text.substring(0, sIdx).trim();
    }
    if (romans.length > 0) {
      const last = romans[romans.length - 1];
      const sIdx = last.text.search(/(Choose the correct|Select the correct|Which of the following)/i);
      if (sIdx !== -1) last.text = last.text.substring(0, sIdx).trim();
    }
  }

  const maxRows = Math.max(alphas.length, romans.length);

  return (
    <div className="space-y-6 text-slate-800 my-4">
      {prefix && <p className="text-[15px] font-semibold text-blue-900 leading-relaxed bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-sm">{prefix}</p>}
      
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-2 bg-gradient-to-r from-blue-600 to-indigo-600 divide-x divide-white/20">
          <div className="px-5 py-3 text-center font-bold text-white tracking-widest uppercase text-sm shadow-inner">
            List I
          </div>
          <div className="px-5 py-3 text-center font-bold text-white tracking-widest uppercase text-sm shadow-inner">
            List II
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: maxRows }).map((_, idx) => {
            const alpha = alphas[idx];
            const roman = romans[idx];
            
            return (
              <div key={idx} className="grid grid-cols-2 divide-x divide-slate-100 group hover:bg-slate-50/80 transition-all duration-200">
                <div className="p-5 flex gap-4 items-start">
                  {alpha ? (
                    <>
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shadow-sm ring-2 ring-blue-50">
                        {alpha.id}
                      </span>
                      <span className="text-[15px] font-medium text-slate-700 leading-relaxed pt-1">{alpha.text}</span>
                    </>
                  ) : <span className="text-slate-400 italic self-center mx-auto">--</span>}
                </div>
                <div className="p-5 flex gap-4 items-start">
                  {roman ? (
                    <>
                      <span className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm shadow-sm ring-2 ring-indigo-50">
                        {roman.id}
                      </span>
                      <span className="text-[15px] font-medium text-slate-700 leading-relaxed pt-1">{roman.text}</span>
                    </>
                  ) : <span className="text-slate-400 italic self-center mx-auto">--</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {suffix && <p className="text-[15px] font-bold text-slate-700 leading-relaxed px-4 py-2 border-l-4 border-amber-400 bg-amber-50/50 rounded-r-lg">{suffix}</p>}
    </div>
  );
};


const QuestionDisplay = ({
  question,
  questionIndex,
  totalQuestions,
  savedResponse,
  onSave,
  onClear,
  onNext,
  isLast,
}) => {
  const [selectedOption, setSelectedOption] = useState(savedResponse?.selectedOption ?? null);
  const [, setMarked] = useState(savedResponse?.markedForReview || false);

  useEffect(() => {
    setSelectedOption(savedResponse?.selectedOption ?? null);
    setMarked(Boolean(savedResponse?.markedForReview));
  }, [question._id, savedResponse]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    if (onClear) onClear(question._id);
  };

  const handleMarkAndNext = () => {
    setMarked(true);
    onSave(question._id, selectedOption, true);
    if (!isLast) onNext();
  };

  const handleSaveAndNext = () => {
    setMarked(false);
    onSave(question._id, selectedOption, false);
    if (!isLast) onNext();
  };

  // Strip trailing hash e.g., [9f570370]
  const cleanQuestionText = question.questionText?.replace(/\[[a-f0-9]{8}\]$/i, '').trim() || '';

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-800">
      {/* Question Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-blue-50 border-b border-blue-200 shadow-sm">
        <span className="font-bold text-sm text-blue-900">Question No. {questionIndex + 1}</span>
      </div>

      {/* Question Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-5 select-none">
        <div className="mb-6">
          <MatchTableParser text={cleanQuestionText} />
          
          {question.image?.url && (
            <div className="mt-4">
              <img src={question.image.url} alt="Question figure" className="max-w-full h-auto border border-gray-300" />
            </div>
          )}

          {question.images?.some((img) => img.url) && (
            <div className="mt-4 space-y-4">
              {question.images.filter((img) => img.url).map((img, idx) => (
                <img key={idx} src={img.url} alt={`Question figure ${idx + 1}`} className="max-w-full h-auto border border-gray-300" />
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4 mt-6">
          {Object.entries(question.options || {}).map(([key, option]) => {
            const isSelected = selectedOption === key;
            return (
              <label 
                key={key}
                className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                  {key}
                </div>
                <div className="flex-1 text-[17px] text-slate-800 font-medium leading-relaxed">
                  {option.text}
                  {option.image?.url && (
                    <img src={option.image.url} alt={`Option ${key}`} className="mt-3 max-w-full rounded-lg border border-slate-200 shadow-sm" />
                  )}
                </div>
                <input
                  type="radio"
                  name={`q-${question._id}`}
                  value={key}
                  checked={isSelected}
                  onChange={() => handleSelectOption(key)}
                  className="hidden"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar (NTA Exact Buttons) */}
      <div className="bg-gray-100 border-t border-gray-300 p-3 flex flex-wrap gap-2 justify-between items-center text-sm font-semibold">
        <div className="flex gap-2">
          <button 
            onClick={handleSaveAndNext}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border border-green-700 rounded shadow-sm transition-colors"
          >
            Save & Next
          </button>
          <button 
            onClick={handleClearResponse}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-400 rounded shadow-sm transition-colors"
          >
            Clear Response
          </button>
          <button 
            onClick={handleMarkAndNext}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border border-orange-600 rounded shadow-sm transition-colors"
          >
            Save & Mark for Review
          </button>
          <button 
            onClick={() => { setMarked(true); onSave(question._id, selectedOption, true); if (!isLast) onNext(); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded shadow-sm transition-colors"
          >
            Mark for Review & Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
