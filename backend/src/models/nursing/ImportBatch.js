const mongoose = require('mongoose');

const ImportBatchSchema = new mongoose.Schema({
  fileName: String,
  format: { type: String, enum: ['csv', 'json'], required: true },
  status: { type: String, enum: ['PREVIEWED', 'IMPORTED', 'PARTIAL', 'FAILED'], default: 'PREVIEWED' },
  totalRows: { type: Number, default: 0 },
  validRows: { type: Number, default: 0 },
  invalidRows: { type: Number, default: 0 },
  importedRows: { type: Number, default: 0 },
  errors: [{ row: Number, messages: [String] }],
  preview: [mongoose.Schema.Types.Mixed],
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('NursingImportBatch', ImportBatchSchema);
