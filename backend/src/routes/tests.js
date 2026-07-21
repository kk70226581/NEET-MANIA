const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  generateTest,
  getTest,
  getTestQuestions,
  startTest,
  saveResponse,
  submitTest,
  getResults,
  getUserAttempts,
  explainQuestion
} = require('../controllers/testController');

// All routes require authentication
router.use(authenticate);

// Test attempts - MUST BE BEFORE /:testId routes
router.get('/attempts', getUserAttempts);
router.put('/attempts/:attemptId/response', saveResponse);
router.put('/attempts/:attemptId/submit', submitTest);
router.get('/attempts/:attemptId/results', getResults);
router.post('/attempts/:attemptId/explain-question', explainQuestion);

// Generate & Get tests
router.post('/generate', generateTest);
router.get('/:testId', getTest);
router.get('/:testId/questions', getTestQuestions);

// Test attempts
router.post('/:testId/start', startTest);

module.exports = router;
