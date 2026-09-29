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

const generateFallbackMentorReply = (message, studentName) => {
  const name = studentName || 'yaar';
  const text = String(message || '').toLowerCase();

  if (/^(hi|hello|hey|namaste|pranam|good\s*(morning|evening|afternoon)|bhaiya\b)/i.test(text.trim())) {
    return `Hey ${name}! Main yahin hoon 😊 Batao aaj Physics, Chemistry ya Biology me kahan phas rahe ho? Jo bhi doubt hai, seedha poochho! 🧠`;
  }

  if (/(physics|formula|numerical|kinematics|projectile|rotation|mechanics|gravitation|electrostat|current|optics|ray|wave|thermo)/i.test(text)) {
    return `Dekho ${name}, Physics me numericals se darna band karo! Pehle given values likho, standard units (SI) check karo, aur basic formula identify karo 💡 Zyada complex calculation me mat uljho, NEET me conceptual step zyada important hota hai. NCERT formula sheet aur solved examples ek baar haath se likh kar dekho, speed apne aap banegi! 👍`;
  }

  if (/(chem|organic|inorganic|equilibrium|reaction|reagent|p-block|d-block|coordination|sn1|sn2|benzene|acid|base|mole)/i.test(text)) {
    return `Sun ${name}, Chemistry NEET ka sabse high-scoring area hai 🙂 Organic me reagents ke specific functions (jaise reducing vs oxidizing agents) ka ek chart bana lo. Inorganic me sirf aur sirf NCERT line-by-line padhna hai, especially exceptions aur tables! Physical me direct formula calculation practice karo roz 15 questions 🔥`;
  }

  if (/(bio|biology|genetics|dna|cell|ncert|ecology|plant|morphology|anatomy|physiology|evolution|zoology|botany)/i.test(text)) {
    return `Arey ${name}, Biology me 340+ lana bilkul possible hai! Bas do cheezein follow karo: NCERT ke har diagram ke labels dhyan se dekho, aur confusing terms (jaise meiosis stages ya genetic ratios) ko flashcard bana kar revise karo 🧠 Roz 40–50 PYQs lagao, confidence instantly badhega! 💡`;
  }

  if (/(mock|score|marks|test|negative|time\s*manage|speed|accuracy|percentile)/i.test(text)) {
    return `Dekho ${name}, mock test me marks kam aana normal hai, problem tab hai jab analysis na karo 🙂 Agle test me pehle Biology 45 mins me niptao, phir Chemistry 50 mins, aur Physics ke liye pure 60+ mins bachao. Negative marking sirf un questions se hoti hai jahan 50-50 guess marte ho — unhe strictly leave karna seekho! 🎯`;
  }

  if (/(stress|dar|scared|demotivated|anxiety|depression|drop|backlog|tired|padhai\s*nahi\s*ho\s*rahi)/i.test(text)) {
    return `Suno ${name}, ek lambi saans lo 🙂 NEET ek marathon hai, sprint nahi. Har topper bhi tumhari tarah doubts aur stress se guzarta hai. Backlog ki chinta chhod kar bas aaj ke 3 targets poore karo. Main tumhare saath hoon, bas give up mat karna! Chalo, ek chhota topic pakad kar shuru karo 🔥`;
  }

  return `Haan ${name}, ye point samajh gaya! Isko solve karne ke liye NCERT ka core concept pakdo aur pehle previous 5 years ke PYQs dekho ki examiner is topic se kya poochta hai 💡 Ek baar formula ya key line note kar lo, fir aage badhte hain. Aur batao, isme specifically kahan confusion hai? 🙂`;
};

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

    let replyText = '';
    try {
      const text = await getGeminiText({
        systemInstruction: 'You are a warm, practical Indian elder brother (Bhaiya) and NEET mentor chatting on WhatsApp. Be human, encouraging, slightly expressive, and use 1–3 natural emojis in each reply. Answer directly before motivating. Never sound scripted, overly formal, or like copied notes. Use plain text only: never markdown, LaTex, asterisks, or code formatting. Do not invent prior conversation context.',
        prompt,
        maxOutputTokens: 460,
        temperature: 0.85
      });
      replyText = keepReplyShort(text);
    } catch (aiError) {
      console.warn(`[Mentor Chat] AI engine call failed (${aiError.message}). Using NEET Bhaiya contextual response.`);
      replyText = generateFallbackMentorReply(cleanMessage, req.user?.firstName);
    }

    const assistantMessage = {
      sender: 'ai',
      text: replyText || 'Arre, ek baar phir bhejo yaar — main properly samjhata hoon 😊',
      createdAt: new Date()
    };
    conversation.messages.push(assistantMessage);
    await conversation.save();
    res.json({
      success: true,
      message: conversation.messages[conversation.messages.length - 1],
      conversation: conversationSummary(conversation)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
