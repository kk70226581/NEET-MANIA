import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Atom,
  BookOpenCheck,
  BrainCircuit,
  Check,
  Copy,
  Dna,
  FlaskConical,
  Lightbulb,
  Plus,
  Send,
  Sparkles,
  Stethoscope,
  Zap,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { mentorAPI } from '../services/api';

const suggestions = [
  { icon: BrainCircuit, title: 'Explain a concept', prompt: 'Explain mitosis simply with an easy NEET example.', tone: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: BookOpenCheck, title: 'Plan my revision', prompt: 'Make a focused NEET revision plan for today.', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { icon: Lightbulb, title: 'Analyse a mistake', prompt: 'Help me understand why my answer was wrong.', tone: 'bg-amber-50 text-amber-600 border-amber-100' },
];

const subjectPrompts = [
  { label: 'Biology', icon: Dna, prompt: 'Help me revise an important Biology concept for NEET.' },
  { label: 'Physics', icon: Atom, prompt: 'Teach me a difficult Physics concept step by step.' },
  { label: 'Chemistry', icon: FlaskConical, prompt: 'Give me a quick Chemistry concept revision.' },
];

const MentorPage = () => {
  const studentName = useSelector((state) => state.user.user?.firstName) || 'Aspirant';
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
  }, [input]);

  const newChat = () => {
    setConversationId(null);
    setMessages([]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (suggestedText) => {
    const text = (typeof suggestedText === 'string' ? suggestedText : input).trim();
    if (!text || isLoading) return;

    setMessages((current) => [...current, { sender: 'user', text, createdAt: new Date().toISOString() }]);
    setInput('');
    setIsLoading(true);

    try {
      let activeId = conversationId;
      if (!activeId) {
        const created = await mentorAPI.createConversation();
        activeId = created.conversation._id;
        setConversationId(activeId);
      }
      const response = await mentorAPI.chat(activeId, text);
      setMessages((current) => [...current, response.message]);
    } catch (error) {
      setMessages((current) => [...current, {
        sender: 'ai',
        text: 'The connection dropped for a moment. Please send that doubt once more - I am right here.',
        createdAt: new Date().toISOString(),
        failed: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(index);
      setTimeout(() => setCopiedMessage(null), 1600);
    } catch (error) {
      console.error('Could not copy message', error);
    }
  };

  const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <AppShell>
      <div className="h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_15%_10%,rgba(219,234,254,.85),transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff)] p-2 sm:p-4 lg:p-5">
        <section className="relative mx-auto flex h-full max-w-[1280px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-2xl shadow-slate-900/10 sm:rounded-[28px]">
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20"><Stethoscope size={24} /><span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-400" /></div>
                <div className="min-w-0"><h1 className="truncate text-base font-black text-slate-900 sm:text-lg">NEET Bhaiya</h1><p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500"><Sparkles size={12} className="text-blue-500" /> Focused help for every NEET doubt</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Online</div>
                <button type="button" onClick={newChat} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Plus size={16} /><span className="hidden sm:inline">New chat</span></button>
              </div>
            </header>

            {messages.length > 0 && (
              <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-2.5 no-scrollbar sm:px-6">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Ask next</span>
                {subjectPrompts.map(({ label, icon: Icon, prompt }) => <button type="button" key={label} disabled={isLoading} onClick={() => sendMessage(prompt)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"><Icon size={13} />{label}</button>)}
              </div>
            )}

            <main className="relative flex-1 overflow-y-auto bg-slate-50/80 no-scrollbar">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(219,234,254,.75),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(237,233,254,.55),transparent_30%)]" />
              <div className="relative mx-auto flex min-h-full max-w-4xl flex-col px-4 py-6 sm:px-7">
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="m-auto w-full max-w-2xl py-5 text-center">
                    <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-blue-500/25"><BrainCircuit size={36} /><motion.span animate={{ rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -right-3 -top-2 grid h-9 w-9 place-items-center rounded-xl border border-slate-100 bg-white text-amber-500 shadow-lg"><Zap size={17} /></motion.span></div>
                    <span className="mt-5 inline-block text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Your personal doubt space</span>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">What are we learning today, {studentName}?</h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-6 text-slate-500">Ask a question, revise a chapter, or untangle a difficult concept. I will explain it step by step in clear Hinglish.</p>
                    <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
                      {suggestions.map(({ icon: Icon, title, prompt, tone }) => (
                        <motion.button whileHover={{ y: -4 }} type="button" key={title} onClick={() => sendMessage(prompt)} className={`group rounded-2xl border p-4 transition-shadow hover:shadow-lg ${tone}`}>
                          <Icon size={20} /><strong className="mt-5 block text-sm text-slate-800">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{prompt}</span><span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-current">Ask now <Send size={11} /></span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="my-auto space-y-6 py-2">
                    {messages.map((item, index) => {
                      const isUser = item.sender === 'user';
                      return (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} key={`${item.createdAt || 'message'}-${index}`} className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          {!isUser && <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"><BrainCircuit size={17} /></span>}
                          <div className={`flex max-w-[86%] flex-col sm:max-w-[76%] ${isUser ? 'items-end' : 'items-start'}`}>
                            <div className={`relative rounded-2xl px-4 py-3.5 text-sm font-medium leading-7 shadow-sm sm:text-[15px] ${isUser ? 'rounded-br-md bg-blue-600 text-white shadow-blue-500/10' : item.failed ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-700' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap">{item.text}</p></div>
                            <div className="mt-1.5 flex items-center gap-2 px-1 text-[10px] font-semibold text-slate-400"><span>{isUser ? 'You' : 'NEET Bhaiya'} · {formatTime(item.createdAt)}</span>{!isUser && !item.failed && <button type="button" onClick={() => copyMessage(item.text, index)} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 opacity-0 transition hover:bg-slate-200 group-hover:opacity-100 focus:opacity-100">{copiedMessage === index ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}</button>}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {isLoading && <div className="flex gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white"><BrainCircuit size={17} /></span><div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex items-center gap-1.5"><i className="h-2 w-2 animate-bounce rounded-full bg-blue-400" /><i className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:120ms]" /><i className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:240ms]" /></div><span className="mt-2 block text-[10px] font-semibold text-slate-400">Bhaiya is thinking...</span></div></div>}
                    <div ref={endRef} />
                  </div>
                )}
              </div>
            </main>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 pl-4 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <textarea ref={inputRef} value={input} maxLength={3000} disabled={isLoading} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder={`Ask a NEET doubt, ${studentName}...`} rows={1} className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-3 text-sm font-medium leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60" />
                  <button type="button" onClick={() => sendMessage()} disabled={!input.trim() || isLoading} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-35"><Send size={18} /></button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-medium text-slate-400"><span>Enter to send · Shift + Enter for a new line</span><span>{input.length}/3000</span></div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default MentorPage;
