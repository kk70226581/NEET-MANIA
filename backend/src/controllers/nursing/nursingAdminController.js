const {
  ContentCollectionJob,
  QuestionValidation,
  QuestionSource,
  ExamEvent,
  StudentReport,
  DuplicateQuestionRecord,
  Chapter,
  Question,
  Subject
} = require('../../models/nursing');

exports.getAdminOverview = async (req, res) => {
  try {
    const [
      failedJobs,
      lowConfidenceVal,
      copyrightWarnings,
      tentativeEvents,
      studentReports,
      duplicateWarnings,
      totalQuestionsCount,
      subjects
    ] = await Promise.all([
      ContentCollectionJob.find({ status: 'failed' }).limit(10),
      QuestionValidation.find({ validationStatus: { $in: ['failed', 'flagged_for_manual'] } }).populate('question').limit(10),
      QuestionSource.find({ copyrightStatus: { $in: ['restricted', 'pending'] } }).populate('question').limit(10),
      ExamEvent.find({ isTentative: true }).populate('exam'),
      StudentReport.find({ status: 'pending' }).populate('question'),
      DuplicateQuestionRecord.find({ status: 'pending_resolution' }).populate('questionA').populate('questionB'),
      Question.countDocuments(),
      Subject.find()
    ]);

    const chapters = await Chapter.find().populate('subjectId');
    const gaps = [];

    for (const chap of chapters) {
      const qCount = await Question.countDocuments({ chapter: chap._id });
      const targetCount = chap.targetQuestionCount || 200;
      if (qCount < targetCount) {
        gaps.push({
          chapterId: chap._id,
          chapterName: chap.fullChapterName,
          subjectName: chap.subjectId?.name,
          currentCount: qCount,
          targetCount
        });
      }
    }

    res.json({
      success: true,
      data: {
        failedJobsCount: failedJobs.length,
        failedJobs,
        lowConfidenceVal,
        copyrightWarnings,
        tentativeEvents,
        studentReports,
        duplicateWarnings,
        totalQuestionsCount,
        subjectsCount: subjects.length,
        coverageGaps: gaps,
        gapsCount: gaps.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Resolve student report
exports.resolveStudentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await StudentReport.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = 'resolved';
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({ success: true, message: 'Student report marked as resolved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Resolve duplicate record
exports.resolveDuplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // 'resolved_kept' or 'resolved_deleted'

    const duplicate = await DuplicateQuestionRecord.findById(id);
    if (!duplicate) return res.status(404).json({ success: false, message: 'Duplicate record not found' });

    duplicate.status = resolution;
    duplicate.resolvedBy = req.user.id;
    duplicate.resolvedAt = new Date();
    await duplicate.save();

    res.json({ success: true, message: `Duplicate resolved as ${resolution}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
