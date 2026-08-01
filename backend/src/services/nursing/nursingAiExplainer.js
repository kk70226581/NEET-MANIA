const geminiClient = require('../geminiClient');
const Chapter = require('../../models/nursing/Chapter');
const Topic = require('../../models/nursing/Topic');
const Subject = require('../../models/nursing/Subject');

exports.generateTopicExplanation = async ({ topicId, language = 'english', accuracy = 50 }) => {
  const topic = await Topic.findById(topicId).populate('chapterId');
  if (!topic) throw new Error('Topic not found');
  
  const chapter = topic.chapterId;
  const subject = await Subject.findById(chapter.subjectId);

  // Determine explanation complexity based on accuracy (Personalization rule #29)
  let complexityInstruction = '';
  if (accuracy < 50) {
    complexityInstruction = 'Use simpler explanations. Give more basic examples. Break the concept down into very small, easily digestible parts. Assume foundational knowledge might be weak.';
  } else if (accuracy > 75) {
    complexityInstruction = 'Reduce basic repetition. Focus on advanced applications, PYQ-style reasoning, and common exam traps. Be concise and high-yield.';
  } else {
    complexityInstruction = 'Use standard explanations. Mix foundation concepts with standard practice applications.';
  }

  const prompt = `
    You are an expert B.Sc. Nursing Entrance Exam teacher.
    
    Context:
    Subject: ${subject.name}
    Chapter: ${chapter.fullChapterName}
    Topic: ${topic.name}
    Learning Objective: ${topic.learningObjective || 'Understand the core concepts of this topic for nursing entrance exams.'}
    Language: ${language}
    
    Student Adaptation:
    ${complexityInstruction}
    
    Task:
    Generate a comprehensive, structured explanation for this topic following this EXACT JSON format. Do not include markdown outside the JSON.
    
    {
      "topicName": "${topic.name}",
      "learningObjective": "Explain what the student should understand after this.",
      "simpleExplanation": "Clear language explanation appropriate for Class 11-12 level.",
      "detailedExplanation": "Complete conceptual explanation within entrance syllabus boundaries.",
      "keyTerms": [
        { "term": "Term1", "definition": "Def1" }
      ],
      "importantPoints": ["High-yield exam point 1", "Point 2"],
      "formulaOrProcess": "Applicable formulas, mechanisms, cycles, or processes (or null if none)",
      "example": "At least one relevant example.",
      "commonMistakes": "Mistakes students commonly make.",
      "examTraps": "Confusing options or closely related concepts.",
      "memoryAid": "Meaningful mnemonic (only if useful, else null)",
      "quickCheckQuestions": [
        {
          "question": "Easy recall question 1",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why A is correct"
        },
        {
          "question": "Conceptual question 2",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "explanation": "Why B is correct"
        }
      ],
      "topicSummary": ["Concise revision point 1", "Point 2"]
    }
  `;

  const responseText = await geminiClient.getGeminiText({
    prompt,
    systemInstruction: 'You are a precise, JSON-only outputting educational AI.',
    responseMimeType: 'application/json',
    temperature: 0.2
  });

  try {
    return JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('AI generated invalid JSON');
  }
};

exports.solveDoubt = async ({ doubtText, chapterSlug, topicSlug }) => {
  // Similar logic tailored for doubt-solving rules (#18)
  const prompt = `
    A B.Sc. Nursing aspirant has asked a doubt.
    Chapter context (if known): ${chapterSlug || 'Unknown'}
    Topic context (if known): ${topicSlug || 'Unknown'}
    
    Doubt: "${doubtText}"
    
    Rules:
    1. Give the direct answer first.
    2. Explain the underlying concept.
    3. Give an example.
    4. Explain the common mistake.
    5. Ask one short checking question.
    6. Format as JSON.
    
    {
      "directAnswer": "...",
      "conceptExplanation": "...",
      "example": "...",
      "commonMistake": "...",
      "checkingQuestion": {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    }
  `;

  const responseText = await geminiClient.getGeminiText({
    prompt,
    systemInstruction: 'You are a precise, JSON-only outputting educational AI for nursing aspirants.',
    responseMimeType: 'application/json',
    temperature: 0.1
  });

  return JSON.parse(responseText);
};
