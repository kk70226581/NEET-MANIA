const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const {
  generateMockTest,
  startTestAttempt,
  getTestQuestions,
  saveAnswerResponse,
  submitTestAttempt,
  getAttemptResults,
  getStudentAttempts
} = require('../../controllers/nursing/nursingTestController');

router.post('/generate', authenticate, generateMockTest);
router.get('/attempts', authenticate, getStudentAttempts);
router.post('/:testId/start', authenticate, startTestAttempt);
router.get('/:testId/questions', authenticate, getTestQuestions);
router.put('/attempts/:attemptId/response', authenticate, saveAnswerResponse);
router.put('/attempts/:attemptId/submit', authenticate, submitTestAttempt);
router.get('/attempts/:attemptId/results', authenticate, getAttemptResults);

module.exports = router;
