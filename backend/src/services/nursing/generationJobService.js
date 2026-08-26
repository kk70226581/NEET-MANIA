const crypto = require('crypto');
const { GenerationJob, Question, Subject, Chapter, Topic, QuestionValidation, AIQuestionGeneration } = require('../../models/nursing');
const aiClient = require('../geminiClient');
const prompts = require('../../config/nursingPrompts');
const {
  validateQuestionDraft,
  findPotentialDuplicates,
  recordDuplicate
} = require('./questionPlatformService');

const parseAIJson = (text) => {
  const cleaned = String(text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(questions)) throw new Error('AI response must contain a questions array.');
  return questions;
};

const difficultyForIndex = (job, absoluteIndex) => {
  const position = ((absoluteIndex % 100) + 1);
  if (position <= job.difficultyDistribution.easy) return 'easy';
  if (position <= job.difficultyDistribution.easy + job.difficultyDistribution.medium) return 'medium';
  return 'hard';
};

const buildGenerationHash = (input) => crypto.createHash('sha256').update(JSON.stringify({
  exam: input.exam || null,
  subject: input.subject,
  chapter: input.chapter,
  topic: input.topic || null,
  requestedCount: input.requestedCount,
  difficultyDistribution: input.difficultyDistribution,
  questionType: input.questionType || 'mcq',
  language: input.language || 'english',
  promptVersion: prompts.QUESTION_GENERATION
})).digest('hex');

const generateQuestions = async (job, count) => {
  const [subject, chapter, topic] = await Promise.all([
    Subject.findById(job.subject).lean(),
    Chapter.findById(job.chapter).lean(),
    job.topic ? Topic.findById(job.topic).lean() : null
  ]);
  if (!subject || !chapter) throw new Error('Generation taxonomy no longer exists.');

  const requestedDifficulties = Array.from({ length: count }, (_, index) =>
    difficultyForIndex(job, job.completedCount + index)
  );
  const prompt = `Create ${count} original B.Sc. Nursing entrance MCQs as structured JSON.
Exam context: ${job.exam || 'general B.Sc. Nursing entrances'}
Subject: ${subject.name}
Chapter: ${chapter.fullChapterName}
Topic: ${topic?.name || 'balanced chapter coverage'}
Learning objective: ${topic?.learningObjective || chapter.learningObjectives?.join('; ') || 'master the chapter'}
Difficulty sequence: ${requestedDifficulties.join(', ')}
Language: ${job.language}
Question type: ${job.questionType}

Return {"questions":[...]}. Every item must contain questionText, options.A.text, options.B.text,
options.C.text, options.D.text, correctAnswer, explanation.text, difficulty, concept, learningObjective,
and tags. Use exactly one correct answer and plausible distractors. Do not claim a year, source, or official
exam appearance. Do not copy distinctive wording from commercial sources. Vary definitions, concepts,
applications, comparisons, misconceptions, scenarios, and calculations where natural.`;

  const response = await aiClient.getGeminiText({
    prompt,
    systemInstruction: 'You create original, syllabus-bound nursing entrance practice content. Return only valid JSON. Never fabricate sources or official provenance.',
    maxOutputTokens: Number(process.env.NURSING_AI_MAX_OUTPUT_TOKENS || 3500),
    temperature: 0.55,
    responseMimeType: 'application/json'
  });
  return parseAIJson(response).slice(0, count);
};

const validateWithAI = async (questions, subject, chapter) => {
  const prompt = `Independently validate these draft questions for ${subject.name}, chapter ${chapter.fullChapterName}.
Check factual accuracy, exactly one correct answer, explanation consistency, ambiguity, syllabus relevance,
distractor quality, grammar, and difficulty. Return {"results":[{"index":0,"valid":true,
"confidenceScore":0-100,"warnings":[]}]} and do not reveal private reasoning.
Drafts: ${JSON.stringify(questions)}`;
  const response = await aiClient.getGeminiText({
    prompt,
    systemInstruction: 'You are an independent question validator, not the generator. Return only concise JSON judgments.',
    maxOutputTokens: Number(process.env.NURSING_AI_VALIDATION_MAX_TOKENS || 1800),
    temperature: 0.1,
    responseMimeType: 'application/json'
  });
  const parsed = JSON.parse(String(response).replace(/```json/gi, '').replace(/```/g, '').trim());
  return Array.isArray(parsed.results) ? parsed.results : [];
};

const processNextBatch = async (jobId) => {
  const job = await GenerationJob.findById(jobId);
  if (!job) throw new Error('Generation job not found.');
  if (['COMPLETED', 'CANCELLED'].includes(job.status)) return job;
  if (job.status === 'PROCESSING') throw new Error('This generation job is already processing.');

  const remaining = job.requestedCount - job.completedCount - job.failedCount;
  if (remaining <= 0) {
    job.status = job.failedCount ? 'PARTIAL' : 'COMPLETED';
    await job.save();
    return job;
  }

  const batchCount = Math.min(job.batchSize, remaining);
  const log = { batch: job.logs.length + 1, startedAt: new Date(), success: false, generated: 0, validated: 0, rejected: 0 };
  job.status = 'PROCESSING';
  await job.save();

  try {
    const drafts = await generateQuestions(job, batchCount);
    const [subject, chapter] = await Promise.all([Subject.findById(job.subject).lean(), Chapter.findById(job.chapter).lean()]);
    let aiResults = [];
    try {
      aiResults = await validateWithAI(drafts, subject, chapter);
    } catch (validationError) {
      aiResults = drafts.map((_, index) => ({ index, valid: false, confidenceScore: 50, warnings: [`AI validator unavailable: ${validationError.message}`] }));
    }

    for (let index = 0; index < drafts.length; index += 1) {
      const draft = {
        ...drafts[index],
        subject: job.subject,
        chapter: job.chapter,
        topic: job.topic,
        exams: job.exam ? [job.exam] : [],
        difficulty: drafts[index].difficulty || difficultyForIndex(job, job.completedCount + index)
      };
      const ruleResult = validateQuestionDraft(draft, { subject: true, chapter: true });
      const aiResult = aiResults.find(result => Number(result.index) === index) || { valid: false, confidenceScore: 40, warnings: ['Missing independent AI validation result.'] };
      const duplicates = await findPotentialDuplicates(ruleResult.normalized);
      const needsReview = !ruleResult.valid || !aiResult.valid || duplicates.length > 0;
      const question = await Question.create({
        ...ruleResult.normalized,
        questionId: `NSG-AI-${crypto.randomUUID()}`,
        source: 'ai_generated',
        sourceType: 'ai-generated',
        generatedByAI: true,
        isPYQ: false,
        isPublished: false,
        isVerified: false,
        qualityScore: ruleResult.qualityScore,
        confidenceScore: Number(aiResult.confidenceScore || 0),
        duplicateScore: duplicates[0]?.similarity || 0,
        lifecycleStatus: 'NEEDS_REVIEW',
        reviewStatus: needsReview ? 'flagged' : 'pending',
        verificationStatus: 'needs-review',
        aiMetadata: {
          model: aiClient.getGeminiModel(),
          promptVersion: prompts.QUESTION_GENERATION,
          generatedAt: new Date(),
          generationJob: job._id,
          generatorResult: drafts[index],
          validatorResult: aiResult,
          validationWarnings: [...ruleResult.errors, ...ruleResult.warnings, ...(aiResult.warnings || [])]
        }
      });
      await Promise.all([
        QuestionValidation.create({
          question: question._id,
          syllabusRelevanceScore: ruleResult.valid ? 90 : 50,
          answerCorrectnessScore: Number(aiResult.confidenceScore || 0),
          optionUniquenessScore: ruleResult.errors.some(error => error.includes('Options')) ? 0 : 100,
          duplicateDetectionScore: 100 - (duplicates[0]?.similarity || 0),
          semanticSimilarityScore: duplicates[0]?.similarity || 0,
          grammarScore: ruleResult.errors.some(error => error.includes('Question')) ? 40 : 90,
          explanationConsistencyScore: ruleResult.warnings.some(warning => warning.includes('Explanation')) ? 0 : Number(aiResult.confidenceScore || 0),
          factualAccuracyScore: Number(aiResult.confidenceScore || 0),
          safetyCopyrightScore: 100,
          overallConfidenceScore: Number(aiResult.confidenceScore || 0),
          validationStatus: needsReview ? 'flagged_for_manual' : 'passed',
          failureReasons: [...ruleResult.errors, ...(aiResult.warnings || [])]
        }),
        AIQuestionGeneration.create({
          question: question._id,
          modelName: aiClient.getGeminiModel(),
          promptUsed: prompts.QUESTION_GENERATION,
          promptVersion: prompts.QUESTION_GENERATION,
          generationJob: job._id,
          similarityScoreWithOriginal: duplicates[0]?.similarity || 0,
          similarityExplanation: duplicates.length ? 'Lexical candidate requires admin review.' : 'No lexical duplicate above the configured threshold.',
          learningObjective: question.learningObjective,
          generationStatus: 'pending_review'
        })
      ]);
      if (duplicates[0]) await recordDuplicate(question._id, duplicates[0]);
      log.generated += 1;
      if (ruleResult.valid) log.validated += 1;
      else log.rejected += 1;
    }

    job.completedCount += log.generated;
    job.validatedCount += log.validated;
    log.success = true;
    job.status = job.completedCount + job.failedCount >= job.requestedCount
      ? (job.failedCount ? 'PARTIAL' : 'COMPLETED')
      : 'QUEUED';
  } catch (error) {
    job.failedCount += batchCount;
    job.retryCount += 1;
    job.lastError = error.message;
    log.error = error.message;
    job.status = job.completedCount > 0 ? 'PARTIAL' : 'FAILED';
  }

  log.endedAt = new Date();
  job.logs.push(log);
  await job.save();
  return job;
};

module.exports = { buildGenerationHash, processNextBatch };
