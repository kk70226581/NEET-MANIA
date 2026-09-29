const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  getOverview,
  getAiStatus,
  testAiConnection,
  getStudentsList
} = require('../controllers/adminController');

const router = express.Router();

router.get('/overview', authenticate, isAdmin, getOverview);
router.get('/ai-status', authenticate, isAdmin, getAiStatus);
router.post('/test-ai', authenticate, isAdmin, testAiConnection);
router.get('/students', authenticate, isAdmin, getStudentsList);

module.exports = router;
