import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Clock3, FlaskConical, HeartPulse, History, MessageSquare, Microscope, Plus, Send, Sparkles, Stethoscope, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import { mentorAPI } from '../services/api';
import { useSelector } from 'react-redux';

const welcome = (name) => ({ sender: 'ai', text: `Hey ${name}! Main tumhara NEET Bhaiya hoon 😊\n\nAaj kis topic ko easy banate hain? Bina tension doubt bhejo — Biology, Physics ya Chemistry.`, createdAt: new Date().toISOString() });

const MentorPage = () => {
  const studentName = useSelector((state) => state.user.user?.firstName) || 'yaar';
  const intro = welcome(studentName);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const endRef = useRef(null);

  const loadHistory = async () => {
    try { const response = await mentorAPI.getConversations(); setConversations(response.conversations || []); } catch (error) { console.error('Could not load mentor history', error); }
  };
  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const newChat = () => { setConversationId(null); setMessages([]); setInput(''); setHistoryOpen(false); };
  const openConversation = async (id) => {
    try {
      const response = await mentorAPI.getConversation(id);
      setConversationId(response.conversation._id);
      setMessages(response.conversation.messages || []);
      setHistoryOpen(false);
    } catch (error) { console.error('Could not open mentor chat', error); }
  };
  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setMessages((current) => [...current, { sender: 'user', text, createdAt: new Date().toISOString() }]);
    setInput(''); setIsLoading(true);
    try {
      let activeId = conversationId;
      if (!activeId) {
        const created = await mentorAPI.createConversation();
        activeId = created.conversation._id;
        setConversationId(activeId);
      }
      const response = await mentorAPI.chat(activeId, text);
      setMessages((current) => [...current, response.message]);
      setConversations((current) => [{ ...response.conversation }, ...current.filter((item) => item._id !== activeId)]);
    } catch (error) {
      setMessages((current) => [...current, { sender: 'ai', text: 'Connection thoda slow hai 😅 Ek baar phir bhejo, main yahin hoon.', createdAt: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

  return <AppShell eyebrow="Your personal doubt space" title="NEET Bhaiya">
    <div className="mentor-force-light relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white text-slate-900 shadow-sm" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
      <header className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-3"><div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><BrainCircuit size={23}/><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-indigo-700 bg-emerald-400"/></div><div><h2 className="font-bold">NEET Bhaiya</h2><p className="mt-0.5 flex items-center gap-1 text-xs text-indigo-100"><Sparkles size={12}/> Calm help for your toughest doubts</p></div></div>
        <div className="flex items-center gap-2"><button onClick={() => setHistoryOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20"><History size={16}/> <span className="hidden sm:inline">History</span></button><button onClick={newChat} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"><Plus size={16}/> <span className="hidden sm:inline">New chat</span></button></div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/70"><span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Try asking</span>{['Explain mitosis simply', 'Help me revise today', 'Why was my answer wrong?'].map((prompt) => <button key={prompt} onClick={() => setInput(prompt)} className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-950 dark:text-indigo-300">{prompt}</button>)}</div>

      <div className="mentor-scroll flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(238,242,255,.9),transparent_40%)] p-5 sm:p-7" style={{ backgroundColor: '#f8fafc' }}>
        <div className="mx-auto max-w-3xl space-y-5">{!conversationId && messages.length === 0 && <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-8 text-center"><div className="relative mb-6 grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-xl shadow-blue-600/20"><Stethoscope size={42}/><span className="absolute -right-4 -top-2 grid h-10 w-10 place-items-center rounded-2xl bg-white text-rose-500 shadow-lg"><HeartPulse size={20}/></span><span className="absolute -bottom-3 -left-5 grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-500 shadow-lg"><Microscope size={20}/></span></div><h3 className="text-2xl font-extrabold text-slate-900">Hi {studentName}, what are we learning today?</h3><p className="mt-3 max-w-md whitespace-pre-line text-sm leading-6 text-slate-500">{intro.text}</p><div className="mt-6 grid w-full gap-3 sm:grid-cols-2"><button onClick={() => setInput('Explain this concept in a simple way')} className="rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300"><BrainCircuit className="mb-2 text-blue-600" size={19}/><b className="block text-sm">Explain a concept</b><span className="mt-1 block text-xs text-slate-500">Simple, step-by-step help</span></button><button onClick={() => setInput('Help me make a revision plan for today')} className="rounded-2xl border border-emerald-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"><FlaskConical className="mb-2 text-emerald-600" size={19}/><b className="block text-sm">Plan today’s revision</b><span className="mt-1 block text-xs text-slate-500">A focused study plan</span></button></div></div>}{messages.map((item, index) => {
          const user = item.sender === 'user';
          return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} key={`${item.createdAt || 'message'}-${index}`} className={`flex gap-2.5 ${user ? 'justify-end' : 'justify-start'}`}>
            {!user && <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-sm"><BrainCircuit size={16}/></span>}
            <div className={`flex max-w-[82%] flex-col ${user ? 'items-end' : 'items-start'}`}><div className={`rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-sm ${user ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap">{item.text}</p></div><span className="mt-1 px-1 text-[11px] font-medium text-slate-400">{user ? 'You' : 'Bhaiya'}</span></div>
          </motion.div>;
        })}{isLoading && <div className="flex gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white"><BrainCircuit size={16}/></span><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:120ms]"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:240ms]"/></div></div>}<div ref={endRef}/></div>
      </div>

      <div className="border-t border-slate-100 bg-white p-4"><div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 pl-4 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={`Ask anything, ${studentName}...`} rows={1} className="min-h-[44px] flex-1 resize-none bg-transparent py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"/><button onClick={send} disabled={!input.trim() || isLoading} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-40"><Send size={18}/></button></div><p className="mt-2 text-center text-xs text-slate-400">Press Enter to send · Shift + Enter for a new line</p></div>

      <AnimatePresence>{historyOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex justify-end bg-slate-950/25 backdrop-blur-[2px]"><motion.aside initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }} transition={{ type: 'tween', duration: .25 }} className="flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"><div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800"><div><h3 className="font-bold">Chat history</h3><p className="mt-1 text-xs text-slate-500">Open any saved conversation</p></div><button onClick={() => setHistoryOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close history"><X size={19}/></button></div><button onClick={newChat} className="mx-5 mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"><Plus size={17}/> Start a new chat</button><div className="mt-5 flex-1 overflow-y-auto px-3 pb-5">{conversations.length ? conversations.map((item) => <button key={item._id} onClick={() => openConversation(item._id)} className={`mb-1 w-full rounded-xl p-3 text-left transition ${item._id === conversationId ? 'bg-indigo-50 ring-1 ring-indigo-100 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}><span className="flex items-center gap-2"><MessageSquare size={15} className="text-indigo-500"/><b className="line-clamp-1 text-sm">{item.title}</b></span><span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-500">{item.preview || 'Conversation saved'}</span><span className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 size={12}/>{formatDate(item.updatedAt)}</span></button>) : <div className="px-6 py-16 text-center"><History className="mx-auto text-slate-300" size={30}/><p className="mt-3 text-sm font-semibold">No saved chats yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Your conversations appear here after you send your first doubt.</p></div>}</div></motion.aside></motion.div>}</AnimatePresence>
    </div>
  </AppShell>;
};

export default MentorPage;
