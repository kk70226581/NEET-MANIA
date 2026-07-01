import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, RotateCcw } from 'lucide-react';

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
  const [marked, setMarked] = useState(savedResponse?.markedForReview || false);

  useEffect(() => {
    setSelectedOption(savedResponse?.selectedOption ?? null);
    setMarked(Boolean(savedResponse?.markedForReview));
  }, [question._id, savedResponse]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onSave(question._id, option, marked);
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    if (onClear) onClear(question._id);
    else onSave(question._id, null, marked);
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

  return (
    <section className="nta-question-panel">
      <div className="nta-question-heading">
        <div>
          <strong>Question No. {questionIndex + 1}</strong>
          <span>of {totalQuestions}</span>
        </div>
      </div>

      <div className="nta-question-scroll">
        <div className="nta-question-content">
          <p style={{ whiteSpace: 'pre-wrap' }}>{question.questionText}</p>

          {question.image?.url && (
            <figure className="nta-question-figure">
              <img src={question.image.url} alt="Question illustration" />
              {question.image.caption && <figcaption>{question.image.caption}</figcaption>}
            </figure>
          )}

          {question.images?.some((image) => image.url) && (
            <div className="nta-question-images">
              {question.images.filter((image) => image.url).map((image, index) => (
                <figure className="nta-question-figure" key={`${image.url}-${index}`}>
                  <img src={image.url} alt={image.caption || `Question figure ${index + 1}`} />
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>

        <div className="nta-options" role="radiogroup" aria-label={`Options for question ${questionIndex + 1}`}>
          {Object.entries(question.options || {}).map(([key, option]) => {
            const isSelected = selectedOption === key;
            return (
              <label className={`nta-option ${isSelected ? 'is-selected' : ''}`} key={key}>
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={key}
                  checked={isSelected}
                  onChange={() => handleSelectOption(key)}
                />
                <span className="nta-option-letter">{key}</span>
                <span className="nta-option-copy">
                  {option.text}
                  {option.image?.url && <img src={option.image.url} alt={`Option ${key}`} />}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="nta-question-actions">
        <button type="button" className="nta-action nta-action-review" onClick={handleMarkAndNext}>
          <Flag size={16} /> {marked ? 'Marked - Next' : 'Mark for Review & Next'}
        </button>
        <button
          type="button"
          className="nta-action nta-action-clear"
          onClick={handleClearResponse}
          disabled={!selectedOption}
        >
          <RotateCcw size={16} /> Clear Response
        </button>
        <div className="nta-action-spacer" />
        <button type="button" className="nta-action nta-action-previous" onClick={onPrevious} disabled={isFirst}>
          <ArrowLeft size={16} /> Previous
        </button>
        <button type="button" className="nta-action nta-action-save" onClick={handleSaveAndNext}>
          {isLast ? 'Save Answer' : 'Save & Next'} {!isLast && <ArrowRight size={16} />}
        </button>
      </div>
    </section>
  );
};

export default QuestionDisplay;
