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
  onPrevious,
  isFirst,
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
    <div className="flex h-full flex-col bg-slate-50 font-sans text-slate-800">
      {/* NTA Question Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 bg-white px-5 py-3 gap-2 shadow-sm select-none">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D47A1]">Section: {question.subject ? question.subject.toUpperCase() : 'GENERAL'}</span>
          <p className="mt-0.5 text-base font-black text-slate-900">Question No. {questionIndex + 1}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded border border-green-200">Correct Marks: +4</span>
          <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-200">Negative Marks: -1</span>
        </div>
      </div>

      {/* Question Content Scrollable Area */}
      <div className="flex-1 select-none overflow-y-auto p-3 pb-6 sm:p-7">
        <div className="mx-auto mb-4 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-7">
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

        {/* Options in NTA Style */}
        <div className="mx-auto mt-5 w-full max-w-5xl space-y-3">
          {Object.entries(question.options || {}).map(([key, option]) => {
            const isSelected = selectedOption === key;
            return (
              <label 
                key={key}
                className={`group flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 bg-white ${isSelected ? 'border-[#0D47A1] bg-blue-50/40 ring-1 ring-[#0D47A1]' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <input
                  type="radio"
                  name={`q-${question._id}`}
                  value={key}
                  checked={isSelected}
                  onChange={() => handleSelectOption(key)}
                  className="w-4 h-4 text-[#0D47A1] focus:ring-[#0D47A1] border-slate-300 cursor-pointer"
                />
                <div className="min-w-0 flex-1 break-words text-[15px] font-semibold text-slate-700">
                  <span className="font-extrabold mr-2">({key})</span>
                  {option.text}
                  {option.image?.url && (
                    <img src={option.image.url} alt={`Option ${key}`} className="mt-3 max-w-full rounded-lg border border-slate-200 shadow-sm" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* NTA Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-slate-100 p-4 select-none">
        
        {/* Left Actions */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button 
            onClick={handleSaveAndNext}
            className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded border border-transparent shadow transition-all duration-200"
          >
            Save & Next
          </button>
          
          <button 
            onClick={handleClearResponse}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider rounded border border-slate-300 shadow-sm transition-all duration-200"
          >
            Clear Response
          </button>

          <button 
            onClick={handleMarkAndNext}
            className="px-5 py-2.5 bg-[#ED6C02] hover:bg-[#E65100] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded border border-transparent shadow transition-all duration-200"
          >
            Mark for Review & Next
          </button>
        </div>

        {/* Right Navigation */}
        <div className="flex gap-2 justify-center sm:justify-end">
          <button 
            disabled={isFirst} 
            onClick={onPrevious} 
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs sm:text-sm font-bold uppercase tracking-wider rounded border border-slate-300 shadow-sm transition-all duration-200"
          >
            &lt;&lt; Back
          </button>
          
          <button 
            disabled={isLast} 
            onClick={onNext} 
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs sm:text-sm font-bold uppercase tracking-wider rounded border border-slate-300 shadow-sm transition-all duration-200"
          >
            Next &gt;&gt;
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuestionDisplay;
