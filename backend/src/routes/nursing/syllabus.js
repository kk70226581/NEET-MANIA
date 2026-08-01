const express = require('express');
const router = express.Router();
const syllabusController = require('../../controllers/nursing/syllabusController');
const auth = require('../../middleware/auth');

router.get('/exams', syllabusController.getExams);
router.get('/subjects', syllabusController.getSubjects);
router.get('/chapters', syllabusController.getChapters);
router.get('/topics', syllabusController.getTopics);

module.exports = router;
