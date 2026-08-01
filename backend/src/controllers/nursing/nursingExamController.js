const { Exam, ExamEvent, SyllabusUnit, Subject, Chapter, Topic } = require('../../models/nursing');

// Get all B.Sc. Nursing Exams
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single exam details
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get active timelines / events for an exam
exports.getExamEvents = async (req, res) => {
  try {
    const events = await ExamEvent.find({ exam: req.params.examId }).sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get syllabus mapping structure for an exam
exports.getExamSyllabus = async (req, res) => {
  try {
    const syllabus = await SyllabusUnit.find({ exam: req.params.examId })
      .populate('subject')
      .populate('chapter')
      .populate('topic');
    res.json({ success: true, data: syllabus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get chapters for a subject
exports.getChaptersBySubject = async (req, res) => {
  try {
    const chapters = await Chapter.find({ subject: req.params.subjectId });
    res.json({ success: true, data: chapters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get topics for a chapter
exports.getTopicsByChapter = async (req, res) => {
  try {
    const topics = await Topic.find({ chapter: req.params.chapterId });
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
