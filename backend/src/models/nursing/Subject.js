const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subjectSlug: {
    type: String,
    unique: true,
    required: true
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingSubject', SubjectSchema);
