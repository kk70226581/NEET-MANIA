const MistakeNotebook = require('../models/MistakeNotebook');

exports.getMistakes = async (req, res) => {
  try {
    const { status = 'pending', subject } = req.query;
    const query = { student: req.userId };
    if (status !== 'all') query.revisionStatus = status;
    if (subject) query['questionDetails.subject'] = subject;
    const mistakes = await MistakeNotebook.find(query)
      .sort({ priority: 1, updatedAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: mistakes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMistake = async (req, res) => {
  try {
    const allowed = {};
    if (req.body.revisionStatus) allowed.revisionStatus = req.body.revisionStatus;
    if (typeof req.body.learningNotes === 'string') allowed.learningNotes = req.body.learningNotes;
    if (typeof req.body.isMarkedImportant === 'boolean') allowed.isMarkedImportant = req.body.isMarkedImportant;
    allowed.updatedAt = new Date();
    const update = { $set: allowed };
    if (req.body.revisionStatus === 'completed') {
      allowed.revisedAt = new Date();
      update.$push = { revisionDates: new Date() };
    }
    const mistake = await MistakeNotebook.findOneAndUpdate(
      { _id: req.params.id, student: req.userId },
      update,
      { new: true }
    );
    if (!mistake) return res.status(404).json({ success: false, message: 'Mistake not found' });
    res.status(200).json({ success: true, data: mistake });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
