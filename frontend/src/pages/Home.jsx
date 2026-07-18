import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, Atom, BarChart3, BookOpen, BrainCircuit, Check, Dna, FlaskConical, HeartPulse, Menu, Sparkles, Target, TrendingUp, Trophy, Users, X, Bot } from 'lucide-react';
import neetDoctorHero from '../assets/neet-doctor-hero.png';

const features = [
  [BookOpen, 'Chapter Wise Tests', 'Master one concept at a time with targeted practice and clear solutions.', 'indigo'],
  [Target, 'Full Mock Exams', 'Build real exam temperament with NEET-pattern mock tests.', 'purple'],
  [BrainCircuit, 'AI Performance Analysis', 'See exactly where marks are being lost and what to revise next.', 'violet'],
  [Trophy, 'Leaderboard', 'Track your position and stay motivated alongside fellow aspirants.', 'indigo'],
  [Bot, 'AI Mentor Bhaiya', 'Your personal 24/7 AI guide to clear any doubt, in Hinglish!', 'purple'],
  [Activity, 'Progress Tracking', 'Watch your accuracy, speed, and consistency improve over time.', 'violet']
];

const categories = [
  ['Biology', '4,200+ questions', Dna, 'from-emerald-500 to-teal-500'],
  ['Physics', '2,100+ questions', Atom, 'from-indigo-500 to-blue-500'],
  ['Chemistry', '2,400+ questions', FlaskConical, 'from-violet-500 to-purple-500'],
  ['Full Syllabus', '180-question mocks', HeartPulse, 'from-rose-500 to-pink-500'],
  ['Previous Year', '25+ years covered', Trophy, 'from-amber-400 to-orange-500']
];

const reviews = [
  ['Priya N.', 'NEET Rank 1,842', 'The AI Mentor feels like a real big brother teaching me. It completely changed how I revise.'],
  ['Rohan K.', 'NEET Rank 3,105', 'The full mocks feel exactly like the real NEET, and checking mistakes is finally easy.'],
  ['Ayesha S.', 'NEET Rank 2,426', 'I use chapter tests after every revision. It keeps me confident and focused.']
];

const navItems = [
  ['Home', '#home'],
  ['AI Mentor', '#ai-mentor'],
  ['Mock Tests', '#mock-tests'],
  ['Leaderboard', '/leaderboard'],
  ['Performance', '/performance']
];

const rise = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [review, setReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setReview((value) => (value + 1) % reviews.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const start = () => navigate('/register');
  const login = () => navigate('/login');
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          <a href="#home" className="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20">
              <HeartPulse size={21}/>
            </span>
            <span className="text-xl">Medical <span className="text-indigo-600">Mania</span></span>
          </a>

          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} className="transition hover:text-indigo-600">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button onClick={login} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
              Login
            </button>
            <button onClick={start} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700">
              Register
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-xl lg:hidden bg-slate-50 text-slate-600">
            {menuOpen ? <X/> : <Menu/>}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden overflow-hidden">
              <div className="grid gap-4 text-sm font-semibold">
                {navItems.slice(1).map(([label, href]) => (
                  <a onClick={closeMenu} href={href} key={label} className="text-slate-600">
                    {label}
                  </a>
                ))}
                <button onClick={login} className="rounded-xl border border-slate-200 py-3 text-slate-700 mt-2">Login</button>
                <button onClick={start} className="rounded-xl bg-indigo-600 py-3 text-white shadow-md">Start free</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="home">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 pb-16 pt-12 lg:pb-24 lg:pt-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.08),transparent_40%)]" />

          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <motion.div {...rise} className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-700">
                <Sparkles size={14}/> Welcome to Medical Mania
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
                Master NEET with <br/>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Mocks</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
                Practice chapter-wise tests, experience real exam patterns, and get 24/7 personal guidance from your very own AI Mentor Bhaiya.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={start} className="inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:-translate-y-1 hover:bg-indigo-700 w-full sm:w-auto">
                  Start Free Practice <ArrowRight size={18}/>
                </button>
                <a href="#ai-mentor" className="inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 w-full sm:w-auto">
                  Meet your AI Mentor <Bot size={18}/>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                {['Real NEET pattern', 'Step-by-step solutions', '100% Free'].map((item) => (
                  <span className="flex items-center gap-2" key={item}>
                    <Check className="text-indigo-600" size={17}/> {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div {...rise} transition={{duration:.6,delay:.1}} className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <img src={neetDoctorHero} alt="NEET aspirant preparing for a medical career" className="h-[400px] w-full rounded-3xl object-cover shadow-2xl lg:h-[500px]" />

              {/* Floating Stat Card */}
              <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:3}} className="absolute -bottom-4 -left-4 sm:left-4 rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
                    <BarChart3 size={24}/>
                  </span>
                  <div>
                    <small className="block text-slate-500 font-bold">Accuracy</small>
                    <b className="text-xl">84% <span className="text-sm text-emerald-500">+8%</span></b>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* NEW: Motivation Section */}
        <section className="bg-slate-900 text-white py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span className="inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-2">
                <HeartPulse size={32} className="text-indigo-300" />
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white italic">
                "The pain you feel today will be the strength you feel tomorrow. Keep pushing. Future doctor, your journey starts here."
              </h2>
              <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full mt-4" />
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-b border-slate-100 bg-white py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 md:grid-cols-4 lg:px-8">
            {[['150K+', 'Students', Users], ['10K+', 'Questions', BookOpen], ['500+', 'Mock Tests', Target], ['24/7', 'AI Mentorship', Bot]].map(([number,label,Icon],i) => (
              <motion.div {...rise} transition={{duration:.35,delay:i*.08}} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center sm:text-left" key={label}>
                <div className="flex justify-center sm:justify-start mb-3">
                  <Icon className="text-indigo-600" size={24}/>
                </div>
                <b className="block text-2xl font-extrabold text-slate-900">{number}</b>
                <span className="text-sm text-slate-500 font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="mock-tests" className="mx-auto max-w-7xl px-5 py-16 lg:py-24 lg:px-8">
          <motion.div {...rise} className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">Everything you need</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Practice smarter, not just harder.</h2>
            <p className="mt-4 text-slate-600">Focused tools for every stage of your NEET preparation.</p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon,title,copy],i) => (
              <motion.article {...rise} transition={{duration:.4,delay:i*.05}} whileHover={{y:-7}} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-indigo-900/10 hover:border-indigo-200" key={title}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon size={24}/>
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* PYQ Intelligence */}
        <section className="border-y border-slate-200 bg-gradient-to-b from-indigo-50 to-white py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <motion.div {...rise}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-2 text-xs font-extrabold text-indigo-700"><TrendingUp size={14}/> PYQ Intelligence Lab</span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Analyze 10 Years of NEET PYQs</h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">See chapter-wise trends, topic frequency, year heatmaps, and a transparent preparation-priority score—then practice the exact areas where your accuracy needs work.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {['10+ years analyzed','Chapter-wise trends','Topic-wise frequency','Smart preparation priority'].map((item)=><span key={item} className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-3 text-sm font-bold text-slate-700"><Check size={16} className="text-emerald-500"/>{item}</span>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>navigate('/pyq/trends')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-200">Explore PYQ Trends <ArrowRight size={17}/></button><button onClick={()=>navigate('/pyq')} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700">Practice PYQs</button></div>
            </motion.div>
            <motion.div {...rise} transition={{delay:.12}} className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-2xl shadow-indigo-900/10">
              <div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Chapter heatmap preview</p><h3 className="mt-1 font-extrabold">Historical question frequency</h3></div><BarChart3 className="text-indigo-600"/></div>
              <div className="mt-6 overflow-hidden rounded-2xl bg-slate-50 p-4"><div className="grid grid-cols-[1.4fr_repeat(6,1fr)] gap-1 text-[10px] font-bold text-slate-400"><span>Chapter</span>{['20','21','22','23','24','25'].map((year)=><span className="text-center" key={year}>{year}</span>)}{[['Human Physiology',[2,3,4,3,5,4]],['Genetics',[1,2,3,4,4,5]],['Ecology',[3,2,4,3,3,4]],['Current Electricity',[1,3,2,4,3,5]],['Chemical Bonding',[2,2,3,3,4,4]]].flatMap(([chapter,values])=>[<span key={`${chapter}-name`} className="truncate py-2 text-xs text-slate-600">{chapter}</span>,...values.map((value,index)=><span key={`${chapter}-${index}`} className="grid h-8 place-items-center rounded-md font-black text-indigo-950" style={{backgroundColor:`rgba(99,102,241,${.12+value*.15})`}}>{value}</span>)])}</div></div>
              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Historical patterns guide preparation; they never guarantee future questions or chapter weightage.</div>
            </motion.div>
          </div>
        </section>

        {/* NEW: AI Mentor Section */}
        <section id="ai-mentor" className="bg-slate-900 py-16 lg:py-24 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...rise}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-extrabold text-indigo-300">
                <Bot size={14}/> Meet your Bhaiya
              </span>
              <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Never get stuck on a doubt again.</h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                The new AI Mentor is customized to act as your loving older brother. Stuck on a physics numerical? Don't understand a biology concept?
                Bhaiya will explain it to you step-by-step in familiar Hinglish, without ever getting frustrated!
              </p>
              <div className="mt-8">
                <button onClick={start} className="rounded-xl bg-white px-6 py-3.5 font-bold text-indigo-900 transition hover:bg-slate-100">
                  Chat with Bhaiya now
                </button>
              </div>
            </motion.div>

            <motion.div {...rise} transition={{delay: 0.2}} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col gap-4">
                <div className="self-end bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm shadow-md">
                  Bhaiya, I don't understand how Action and Reaction work if they are equal. Won't they cancel out?
                </div>
                <div className="self-start bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm shadow-md">
                  Arey chote, tension mat le! Main samjhata hoon. Dekho, action aur reaction equal zaroor hote hain, lekin <b>alag-alag bodies par lagte hain</b>. Isliye wo ek dusre ko cancel nahi karte! Samjhe?
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Test Categories */}
        <section id="pyqs" className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">Choose your practice</span>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A test for every revision day.</h2>
              </div>
              <button onClick={start} className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto">
                View all tests <ArrowRight size={16}/>
              </button>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map(([title,count,Icon,gradient]) => (
                <motion.article whileHover={{y:-5}} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200" key={title}>
                  <span className={`grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4`}>
                    <Icon size={24}/>
                  </span>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500 mb-4">{count}</p>
                  <button onClick={start} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-transparent">
                    Start practice
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white py-16 lg:py-24 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <motion.div {...rise} className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">Loved by aspirants</span>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A little confidence goes a long way.</h2>
            </motion.div>

            <div className="mx-auto mt-12 max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={reviews[review][0]}
                  initial={{opacity:0, x:20}}
                  animate={{opacity:1, x:0}}
                  exit={{opacity:0, x:-20}}
                  transition={{duration: 0.3}}
                  className="rounded-3xl bg-indigo-50 p-8 sm:p-10 text-center border border-indigo-100"
                >
                  <div className="mb-6 text-2xl text-amber-500" aria-label="5 out of 5 stars">{'★'.repeat(5)}</div>
                  <blockquote className="text-lg sm:text-xl leading-relaxed text-slate-700 font-medium">
                    "{reviews[review][2]}"
                  </blockquote>
                  <figcaption className="mt-8 flex items-center justify-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white text-lg shadow-md">
                      {reviews[review][0][0]}
                    </span>
                    <span className="text-left">
                      <b className="block text-slate-900">{reviews[review][0]}</b>
                      <small className="text-slate-500 font-medium">{reviews[review][1]}</small>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>

              <div className="mt-8 flex justify-center gap-2">
                {reviews.map((_,i) => (
                  <button
                    onClick={() => setReview(i)}
                    aria-label={`Show testimonial ${i+1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${i === review ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:py-24 lg:px-8">
          <motion.div {...rise} className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-14 sm:px-12 text-center text-white shadow-2xl">
            <div className="absolute -right-10 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold sm:text-5xl">Ready to Boost Your NEET Score?</h2>
              <p className="mx-auto mt-4 max-w-xl text-indigo-100 text-lg">Join Medical Mania today. Start practising with a clearer plan and more confidence.</p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={start} className="rounded-xl bg-white px-8 py-4 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                  Start Free Test
                </button>
                <button onClick={login} className="rounded-xl border border-white/40 bg-white/10 px-8 py-4 font-bold backdrop-blur transition hover:bg-white/20">
                  Login to Account
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-extrabold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-md">
              <HeartPulse size={16}/>
            </span>
            Medical Mania
          </div>
          <p className="text-sm font-medium text-slate-500">&copy; 2026 Medical Mania. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
