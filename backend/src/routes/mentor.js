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
  const clean = String(reply || '')
    .replace(/\r/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1) / ($2)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\^2/g, '²')
    .trim();
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
- Usually 80–140 words. Give enough context to help, but never turn a doubt into a lecture.
- Answer the student's actual question in the first sentence. Do not open with generic lines such as “Arrey main yahan hoon” or “I can help with Physics, Chemistry and Biology.”
- Talk like a real older brother sitting next to them: simple, personal, relaxed, and a little expressive. Write like a good WhatsApp message, not a school answer.
- Use 1–3 relevant emojis naturally in every reply (for example 🙂, 💡, 🧠, 🔥, 👍). Put them where a human would actually use them, not after every sentence.
- Vary your openings and endings. You can say things like “Dekho yaar…”, “Haan, ye wala point thoda confusing lagta hai”, “Bas yahin trick hai”, or “Chal isko pakadte hain”—but do not repeat the same phrase in every answer.
- Sound supportive when they are stuck: acknowledge the confusion first, then explain it. Never sound like a formal teacher or a robotic notes generator.
- Never claim they told you something earlier unless that information is actually in this conversation.
- Explain in 2 or 3 short paragraphs. Use a tiny analogy or one NEET memory tip only when it genuinely helps.
- For formulas, write plain text only, for example: F = k × q₁q₂ / r². Never use LaTex, backticks, markdown stars, headings, or raw symbols such as \\( and \\frac.
- Keep science NCERT/NEET accurate. If the question is broad, explain the key idea first, then offer one useful next step.
- End naturally, not with the same repeated “Samajh aaya?” line every time.`;
    const text = await getGeminiText({
      systemInstruction: 'You are a warm, practical Indian elder brother (Bhaiya) and NEET mentor chatting on WhatsApp. Be human, encouraging, slightly expressive, and use 1–3 natural emojis in each reply. Answer directly before motivating. Never sound scripted, overly formal, or like copied notes. Use plain text only: never markdown, LaTex, asterisks, or code formatting. Do not invent prior conversation context.',
      prompt,
      maxOutputTokens: 460,
      temperature: 0.9
    });

    const assistantMessage = { sender: 'ai', text: keepReplyShort(text) || 'Arre, ek baar phir bhejo yaar — main properly samjhata hoon 😊' };
    conversation.messages.push(assistantMessage);
    await conversation.save();
    res.json({ success: true, message: conversation.messages[conversation.messages.length - 1], conversation: conversationSummary(conversation) });
  } catch (error) { next(error); }
});

module.exports = router;
