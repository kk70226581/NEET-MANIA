const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BookmarkSchema.index({ student: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('NursingBookmark', BookmarkSchema);
