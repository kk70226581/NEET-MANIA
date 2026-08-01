const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../../middleware/auth');
const {
  getAdminOverview,
  resolveStudentReport,
  resolveDuplicate
} = require('../../controllers/nursing/nursingAdminController');
const { generateQuestions } = require('../../controllers/nursing/questionGeneratorController');

router.get('/overview', authenticate, isAdmin, getAdminOverview);
router.post('/reports/:id/resolve', authenticate, isAdmin, resolveStudentReport);
router.post('/duplicates/:id/resolve', authenticate, isAdmin, resolveDuplicate);
router.post('/generate-questions', authenticate, isAdmin, generateQuestions);

module.exports = router;
