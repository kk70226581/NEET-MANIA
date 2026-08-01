const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const {
  getDailyPractice,
  getChapterPractice,
  getBookmarks,
  toggleBookmark,
  getMistakes,
  addMistake,
  updateMistakeStatus,
  startChapterExplainer,
  continueChapterExplainer
} = require('../../controllers/nursing/nursingPracticeController');

router.get('/daily', authenticate, getDailyPractice);
router.get('/chapter/:chapterId', authenticate, getChapterPractice);
router.get('/bookmarks', authenticate, getBookmarks);
router.post('/bookmarks/toggle', authenticate, toggleBookmark);
router.get('/mistakes', authenticate, getMistakes);
router.post('/mistakes', authenticate, addMistake);
router.patch('/mistakes/:id', authenticate, updateMistakeStatus);

// AI Explainer (AWS Bedrock)
router.post('/explainer/start', authenticate, startChapterExplainer);
router.post('/explainer/continue', authenticate, continueChapterExplainer);

module.exports = router;
