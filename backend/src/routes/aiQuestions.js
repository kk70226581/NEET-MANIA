const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { generate, approveAndSave } = require('../controllers/aiQuestionController');

// Generate candidate questions (do not save)
router.post('/generate', authenticate, isAdmin, generate);

// Approve a reviewed question and save to DB
router.post('/approve', authenticate, isAdmin, approveAndSave);

module.exports = router;
