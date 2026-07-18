const TestGenerator = require('./testGenerator');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');

describe('TestGenerator', () => {
  test('builds filters for arrays and scalar values', () => {
    expect(TestGenerator.buildQuery({
      subject: ['biology', 'botany'],
      difficulty: 'medium',
      source: ['pyq', 'custom'],
      isPublished: true
    })).toEqual({
      subject: { $in: ['biology', 'botany'] },
      difficulty: 'medium',
      source: { $in: ['pyq', 'custom'] },
      isPublished: true,
      inSyllabus: true,
      syllabusVersion: 'NEET-UG-2026',
      'qualityAudit.status': 'approved'
    });
  });

  test('includes legacy botany and zoology labels for Biology requests', () => {
    expect(TestGenerator.buildQuery({ subject: 'biology' }).subject).toEqual({
      $in: ['biology', 'botany', 'zoology']
    });
  });

  test('uses the NEET marking scheme', () => {
    expect(TestGenerator.calculateScore(12, 3)).toBe(45);
  });

  test('returns the configured duration for each test type', () => {
    expect(TestGenerator.getTestConfig('full_mock')).toEqual({
      timeLimit: 180,
      questionCount: 180
    });
  });
});

describe('test identifiers', () => {
  test('new tests and attempts receive collision-resistant identifiers', () => {
    const firstTest = new Test();
    const secondTest = new Test();
    const firstAttempt = new TestAttempt();
    const secondAttempt = new TestAttempt();

    expect(firstTest.testId).toMatch(/^TEST-/);
    expect(secondTest.testId).not.toBe(firstTest.testId);
    expect(firstAttempt.attemptId).toMatch(/^ATTEMPT-/);
    expect(secondAttempt.attemptId).not.toBe(firstAttempt.attemptId);
  });
});
