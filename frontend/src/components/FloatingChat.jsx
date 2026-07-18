import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, BrainCircuit, MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { mentorAPI } from '../services/api';

const welcomeMessage = { sender: 'ai', text: 'Hey! Main tumhara NEET Bhaiya hoon 😊\n\nAaj kis topic ko easy banate hain?', createdAt: new Date().toISOString() };

const FloatingChat = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const startConversation = async () => {
    const response = await mentorAPI.createConversation();
    const conversation = response.conversation;
    setConversationId(conversation._id);
    return conversation._id;
  };

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, isOpen]);

  useEffect(() => {
    const handleAskAI = (event) => { setIsOpen(true); setInput(event.detail.question || ''); };
    window.addEventListener('askAIToExplain', handleAskAI);
    return () => window.removeEventListener('askAIToExplain', handleAskAI);
  }, []);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;
    setMessages((current) => [...current, { sender: 'user', text: message, createdAt: new Date().toISOString() }]);
    setInput('');
    setIsLoading(true);
    try {
      const activeId = conversationId || await startConversation();
      const response = await mentorAPI.chat(activeId, message);
      setMessages((current) => [...current, response.message]);
    } catch (error) {
      setMessages((current) => [...current, { sender: 'ai', text: 'Network thoda slow hai, chote 😅 Ek baar phir bhej do — main yahin hoon.', createdAt: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  if (location.pathname === '/mentor') return null;

  return (
    <>
      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setIsOpen(true)} aria-label="Open AI Mentor" className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl shadow-indigo-500/30 ${isOpen ? 'pointer-events-none scale-75 opacity-0' : ''}`}>
        <MessageCircle size={28} />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && <motion.section initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} className="fixed bottom-5 right-4 z-50 flex h-[min(650px,calc(100vh-40px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[28px] border border-indigo-100 bg-white shadow-2xl shadow-slate-900/20">
          <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><BrainCircuit size={22} /></div><div><h3 className="font-bold">NEET Bhaiya</h3><p className="mt-0.5 flex items-center gap-1 text-xs text-indigo-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Your doubt buddy</p></div></div>
              <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-xl p-2 transition hover:bg-white/15"><X size={20} /></button>
            </div>
            <p className="mt-3 text-xs text-indigo-100">No judgement. Bas doubt bhejo, saath mein sort karte hain ✨</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-indigo-50/60 to-white p-4">
            {messages.map((item, index) => <div key={`${item.createdAt || 'message'}-${index}`} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${item.sender === 'user' ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap">{item.text}</p></div></div>)}
            {isLoading && <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm"><Bot size={15} className="text-violet-600" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]" /></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-slate-100 bg-white p-3"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-3 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSend()} placeholder="Ask your doubt..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" disabled={isLoading} /><button onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Send message" className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-40"><Send size={17} /></button></div></div>
        </motion.section>}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
