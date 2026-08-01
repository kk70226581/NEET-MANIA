const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const {
  getExams,
  getExam,
  getExamEvents,
  getExamSyllabus,
  getSubjects,
  getChaptersBySubject,
  getTopicsByChapter
} = require('../../controllers/nursing/nursingExamController');

router.get('/', authenticate, getExams);
router.get('/subjects', authenticate, getSubjects);
router.get('/subjects/:subjectId/chapters', authenticate, getChaptersBySubject);
router.get('/chapters/:chapterId/topics', authenticate, getTopicsByChapter);
router.get('/:id', authenticate, getExam);
router.get('/:examId/events', authenticate, getExamEvents);
router.get('/:examId/syllabus', authenticate, getExamSyllabus);

module.exports = router;
