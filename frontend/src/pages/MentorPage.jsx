import React, { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Plus, Send, Sparkles } from 'lucide-react';
import AppShell from '../components/AppShell';
import { mentorAPI } from '../services/api';
import { useSelector } from 'react-redux';

const MentorPage = () => {
  const studentName = useSelector((state) => state.user.user?.firstName) || 'yaar';
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  const openConversation = async (id) => {
    const response = await mentorAPI.getConversation(id);
    setConversationId(response.conversation._id);
    setMessages(response.conversation.messages || []);
  };
  const createConversation = async () => {
    const response = await mentorAPI.createConversation();
    const conversation = response.conversation;
    setConversations((current) => [ { _id: conversation._id, title: conversation.title, preview: '', updatedAt: conversation.updatedAt }, ...current]);
    setConversationId(conversation._id);
    setMessages(conversation.messages || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await mentorAPI.getConversations();
        setConversations(response.conversations || []);
        if (response.conversations?.[0]) await openConversation(response.conversations[0]._id);
        else await createConversation();
      } catch (error) { console.error('Could not load mentor chats', error); }
    };
    load();
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const activeId = conversationId;
    if (!activeId) return;
    setMessages((current) => [...current, { sender: 'user', text, createdAt: new Date().toISOString() }]);
    setInput(''); setIsLoading(true);
    try {
      const response = await mentorAPI.chat(activeId, text);
      setMessages((current) => [...current, response.message]);
      setConversations((current) => [{ ...response.conversation }, ...current.filter((item) => item._id !== activeId)]);
    } catch (error) {
      setMessages((current) => [...current, { sender: 'ai', text: 'Connection mein chhota sa issue hai 😅 Ek baar phir message bhejo, main help karta hoon.', createdAt: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  return <AppShell eyebrow="Your personal doubt space" title="NEET Bhaiya">
    <div className="grid h-[calc(100vh-140px)] min-h-[580px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col border-r border-slate-100 bg-slate-50/80 p-4 md:flex"><button onClick={createConversation} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Plus size={17} /> New doubt chat</button><div className="mt-5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Past chats</div><div className="mt-2 flex-1 space-y-1 overflow-y-auto">{conversations.map((item) => <button key={item._id} onClick={() => openConversation(item._id)} className={`w-full rounded-xl p-3 text-left transition ${item._id === conversationId ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-white'}`}><span className="line-clamp-1 text-sm font-medium">{item.title}</span><span className="mt-1 block line-clamp-1 text-xs text-slate-400">{item.preview || 'Start learning together'}</span></button>)}</div></aside>
      <section className="flex min-w-0 flex-col"><header className="flex items-center justify-between bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-4 text-white"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><BrainCircuit size={23} /></div><div><h2 className="font-bold">Your NEET Bhaiya</h2><p className="mt-0.5 flex items-center gap-1 text-xs text-indigo-100"><Sparkles size={12} /> Friendly guidance, serious preparation</p></div></div><button onClick={createConversation} className="rounded-xl bg-white/15 p-2 md:hidden"><Plus size={20} /></button></header>
        <div className="flex flex-wrap gap-2 border-b border-indigo-50 bg-indigo-50/60 px-5 py-3"><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">Try asking</span>{['Explain a concept simply', 'Help me revise today', 'Why was my answer wrong?'].map((prompt) => <button key={prompt} onClick={() => setInput(prompt)} className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs text-indigo-700 transition hover:border-indigo-300">{prompt}</button>)}</div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5 sm:p-7">{messages.map((item, index) => <div key={`${item.createdAt || 'msg'}-${index}`} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] sm:max-w-[680px] ${item.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}><div className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${item.sender === 'user' ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap">{item.text}</p></div><span className="mt-1 px-1 text-[11px] font-medium text-slate-400">{item.sender === 'user' ? 'You' : 'Bhaiya'}</span></div></div>)}{isLoading && <div className="flex"><div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3"><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:240ms]" /></div></div>}<div ref={endRef} /></div>
        <div className="border-t border-slate-100 bg-white p-4"><div className="mx-auto flex max-w-4xl items-end gap-3"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={`Ask anything, ${studentName}...`} rows={1} className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100" /><button onClick={send} disabled={!input.trim() || isLoading} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-40"><Send size={20} /></button></div><p className="mt-2 text-center text-xs text-slate-400">Your chats are saved privately so you can pick up where you left off.</p></div>
      </section>
    </div>
  </AppShell>;
};

export default MentorPage;
