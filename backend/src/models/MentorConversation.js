const mongoose = require('mongoose');

const MentorMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true, trim: true, maxlength: 12000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const MentorConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New doubt', trim: true, maxlength: 90 },
  messages: { type: [MentorMessageSchema], default: [] }
}, { timestamps: true });

MentorConversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('MentorConversation', MentorConversationSchema);
