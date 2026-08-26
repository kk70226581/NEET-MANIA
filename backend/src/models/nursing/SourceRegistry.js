const mongoose = require('mongoose');

const SourceRegistrySchema = new mongoose.Schema({
  sourceName: { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sourceType: {
    type: String,
    enum: ['official', 'public-domain', 'licensed', 'permitted', 'reference-only'],
    required: true
  },
  permissionStatus: {
    type: String,
    enum: ['APPROVED', 'REVIEW_REQUIRED', 'REFERENCE_ONLY', 'BLOCKED'],
    default: 'REVIEW_REQUIRED',
    index: true
  },
  allowedUsage: { type: String, required: true },
  license: String,
  notes: String,
  lastVerifiedAt: Date,
  active: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('NursingSourceRegistry', SourceRegistrySchema);
