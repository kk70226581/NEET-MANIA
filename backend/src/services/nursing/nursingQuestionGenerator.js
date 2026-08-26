const geminiClient = require('../geminiClient');
const Chapter = require('../../models/nursing/Chapter');
const Topic = require('../../models/nursing/Topic');
const Subject = require('../../models/nursing/Subject');
const Question = require('../../models/nursing/Question');

exports.generateBatch = async ({ chapterId, topicId, count = 10, difficulty = 'medium' }) => {
  const chapter = await Chapter.findById(chapterId).populate('subjectId');
  const topic = await Topic.findById(topicId);
  const subject = chapter.subjectId;

  const prompt = `
    Generate ${count} multiple choice questions for B.Sc. Nursing Entrance Exam preparation.
    
    Context:
    Subject: ${subject.name}
    Chapter: ${chapter.fullChapterName}
    Topic: ${topic ? topic.name : 'General Chapter Mix'}
    Difficulty: ${difficulty}
    Target Exam Level: AIIMS / State B.Sc. Nursing
    
    Rules for wrong options:
    - Must be meaningful distractors (common misconceptions, similar terminology, etc.)
    - No joke or obviously incorrect options.
    - Exactly one correct answer.
    
    Format: Return ONLY a JSON array. No markdown, no wrappers.
    
    [
      {
        "questionText": "...",
        "options": {
          "A": { "text": "..." },
          "B": { "text": "..." },
          "C": { "text": "..." },
          "D": { "text": "..." }
        },
        "correctAnswer": "A",
        "explanation": {
          "text": "Detailed explanation of why A is correct and others are wrong."
        },
        "type": "mcq",
        "difficulty": "${difficulty}",
        "bloomsLevel": "understand"
      }
    ]
  `;

  const responseText = await geminiClient.getGeminiText({
    prompt,
    systemInstruction: 'You are an expert question setter for B.Sc. Nursing entrance exams. Output ONLY valid JSON arrays.',
    responseMimeType: 'application/json',
    temperature: 0.4
  });

  try {
    const rawQuestions = JSON.parse(responseText);
    
    // Map to the exact schema before saving
    const mappedQuestions = rawQuestions.map(q => ({
      ...q,
      subject: 'Nursing', // Or mapped to the core subject enum
      chapter: chapter.fullChapterName,
      topic: topic ? topic.name : undefined,
      source: 'ai_generated',
      generatedByAI: true,
      aiMetadata: {
        model: geminiClient.getGeminiModel(),
        prompt: 'NursingBatchGen_v1',
        generatedAt: new Date()
      },
      review: {
        status: 'pending' // Require admin validation or auto-validation
      },
      isPublished: false
    }));

    return mappedQuestions;
  } catch (err) {
    console.error('Failed to parse AI question batch:', responseText);
    throw new Error('AI generated invalid question JSON');
  }
};
