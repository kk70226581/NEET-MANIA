const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getGeminiText } = require('../services/geminiClient');
const MentorConversation = require('../models/MentorConversation');

const starterMessage = (name) => ({
  sender: 'ai',
  text: `Hey ${name}! Main tumhara NEET Bhaiya hoon 😊 Aaj kis topic ko simple banate hain? Physics, Chemistry ya Biology — jo bhi doubt hai, bina hesitation bhejo.`,
  createdAt: new Date()
});

const conversationSummary = (conversation) => ({
  _id: conversation._id,
  title: conversation.title,
  updatedAt: conversation.updatedAt,
  preview: conversation.messages[conversation.messages.length - 1]?.text || ''
});

const keepReplyShort = (reply) => {
  const clean = String(reply || '').replace(/\r/g, '').trim();
  if (clean.length <= 1500) return clean;
  const cutoff = Math.max(clean.lastIndexOf('.', 1500), clean.lastIndexOf('।', 1500), clean.lastIndexOf('!', 1500));
  return `${clean.slice(0, cutoff > 400 ? cutoff + 1 : 1500).trim()}\n\nAb isko ek chhote example se revise kar lena, theek hai? 🙂`;
};

router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await MentorConversation.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .select('title messages updatedAt')
      .limit(30);
    res.json({ success: true, conversations: conversations.map(conversationSummary) });
  } catch (error) { next(error); }
});

router.post('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversation = await MentorConversation.create({
      user: req.userId,
      messages: [starterMessage(req.user.firstName || 'yaar')]
    });
    res.status(201).json({ success: true, conversation });
  } catch (error) { next(error); }
});

router.get('/conversations/:conversationId', authenticate, async (req, res, next) => {
  try {
    const conversation = await MentorConversation.findOne({ _id: req.params.conversationId, user: req.userId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    res.json({ success: true, conversation });
  } catch (error) { next(error); }
});

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    if (!conversationId || !cleanMessage) {
      return res.status(400).json({ success: false, message: 'A conversation and message are required' });
    }

    const conversation = await MentorConversation.findOne({ _id: conversationId, user: req.userId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.messages.push({ sender: 'user', text: cleanMessage });
    if (conversation.messages.filter((item) => item.sender === 'user').length === 1) {
      conversation.title = cleanMessage.slice(0, 90);
    }

    const recentMessages = conversation.messages.slice(-16);
    const chatHistory = recentMessages
      .map((item) => `${item.sender === 'user' ? req.user.firstName || 'Student' : 'Bhaiya'}: ${item.text}`)
      .join('\n');

    const prompt = `Conversation with ${req.user.firstName || 'a NEET student'}:\n${chatHistory}\n\nReply to the latest student message as their caring NEET Bhaiya. The student should feel that an older sibling actually paused, understood their doubt, and is sitting beside them explaining it — not that a bot made revision notes.

Reply rules:
- Usually 100–180 words. Give enough context to feel helpful, but never a giant lecture.
- Start naturally, with a human reaction or reassurance that matches the student's exact doubt. Do not always say “Bilkul”, “Samajh aaya?” or use the same template.
- Explain the core idea in a friendly 2–3 paragraph conversation. Use bullets only when a list truly makes it clearer.
- Add one small real-life analogy, memory trick, or exam tip whenever it fits. Mention their name casually only sometimes, never in every answer.
- Use easy Hinglish and 1–2 genuine emojis maximum. Be warm and slightly playful, but never childish or overly dramatic.
- Keep science NCERT/NEET accurate. If the question is broad, teach the most important part first and invite them to go deeper.
- End like a real Bhaiya with a natural next step, for example “Chal, ab ek example try karte hain” or “Iska diagram bhi yaad kara doon?”
- Do not repeat the student's question. Do not begin with “Bhaiya:” because the chat labels you. Do not use markdown headings or bold text.`;
    const text = await getGeminiText({
      systemInstruction: 'You are a warm Indian elder brother (Bhaiya) and exceptional NEET mentor. Be accurate, concise, and reassuring. Use natural Hinglish and occasional emoji.',
      prompt,
      maxOutputTokens: 460,
      temperature: 0.82
    });

    const assistantMessage = { sender: 'ai', text: keepReplyShort(text) || 'Arre, ek baar phir bhejo yaar — main properly samjhata hoon 😊' };
    conversation.messages.push(assistantMessage);
    await conversation.save();
    res.json({ success: true, message: conversation.messages[conversation.messages.length - 1], conversation: conversationSummary(conversation) });
  } catch (error) { next(error); }
});

module.exports = router;
