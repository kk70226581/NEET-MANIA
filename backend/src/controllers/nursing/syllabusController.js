const Subject = require('../../models/nursing/Subject');
const Chapter = require('../../models/nursing/Chapter');
const Topic = require('../../models/nursing/Topic');
const Exam = require('../../models/nursing/Exam');

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .select('examCode examName conductingAuthority subjects questionCount marks duration')
      .lean();
    res.json({ success: true, exams });
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const { examId } = req.query;
    let query = {};
    if (examId) {
      const exam = await Exam.findById(examId);
      if (exam) {
        const subjectIds = exam.subjects.map(s => s.subjectId);
        query = { _id: { $in: subjectIds } };
      }
    }
    const subjects = await Subject.find(query).sort('displayOrder').lean();
    res.json({ success: true, subjects });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getChapters = async (req, res) => {
  try {
    const { subjectSlug, examId } = req.query;
    if (!subjectSlug) {
      return res.status(400).json({ success: false, message: 'subjectSlug is required' });
    }

    const subject = await Subject.findOne({ subjectSlug });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    let query = { subjectId: subject._id, status: 'active' };

    // If filtering by exam, only get applicable chapters
    if (examId) {
      const exam = await Exam.findById(examId);
      if (exam && exam.applicableChapters && exam.applicableChapters.length > 0) {
        query._id = { $in: exam.applicableChapters };
      }
    }

    const chapters = await Chapter.find(query).sort('displayOrder').lean();

    // Group by units
    const units = {};
    chapters.forEach(chap => {
      const unit = chap.unitName || 'Other';
      if (!units[unit]) units[unit] = [];
      units[unit].push(chap);
    });

    res.json({ success: true, subject, chapters, units });
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const { chapterSlug } = req.query;
    if (!chapterSlug) {
      return res.status(400).json({ success: false, message: 'chapterSlug is required' });
    }

    const chapter = await Chapter.findOne({ chapterSlug });
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const topics = await Topic.find({ chapterId: chapter._id }).sort('displayOrder').lean();
    res.json({ success: true, chapter, topics });
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
