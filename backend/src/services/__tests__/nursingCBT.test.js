const NursingTestGenerator = require('../nursing/nursingTestGenerator');
const { Exam, MockTest, TestAttempt } = require('../../models/nursing');

describe('Nursing CBT Systems', () => {
  test('dynamic marking scheme evaluation matches settings', () => {
    const aiimsScheme = { correctAnswers: 1, incorrectAnswers: -0.33 };
    const cnetScheme = { correctAnswers: 1, incorrectAnswers: 0 };

    const calculateScore = (correct, wrong, scheme) => {
      return (correct * scheme.correctAnswers) + (wrong * scheme.incorrectAnswers);
    };

    expect(Number(calculateScore(10, 3, aiimsScheme).toFixed(2))).toBe(9.01);
    expect(calculateScore(10, 3, cnetScheme)).toBe(10);
  });

  test('collison-resistant nursing models and attempts IDs', () => {
    const mockTest = new MockTest({
      testId: 'MOCK-001',
      testName: 'Sample Exam',
      exam: new Exam()._id,
      duration: 120,
      totalQuestions: 10,
      totalMarks: 10
    });

    const firstAttempt = new TestAttempt({
      attemptId: 'ATTEMPT-N-001',
      student: new Exam()._id,
      mockTest: mockTest._id,
      startTime: new Date()
    });

    expect(mockTest.testId).toBe('MOCK-001');
    expect(firstAttempt.attemptId).toBe('ATTEMPT-N-001');
  });

  test('balanced question selection shuffling matches expected output length', () => {
    const mockQuestionIds = Array.from({ length: 10 }, (_, i) => `Q-${i}`);
    const shuffled = NursingTestGenerator.shuffle(mockQuestionIds);
    expect(shuffled.length).toBe(10);
    expect(shuffled.sort()).toEqual(mockQuestionIds.sort());
  });
});
