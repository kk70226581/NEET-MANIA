import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
  Bell,
  Flame,
  Zap,
  Bot,
  BrainCircuit,
  Trophy,
  Moon,
} from 'lucide-react';
import { logout } from '../store/slices/userSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/question-bank', label: 'Question Bank', icon: BookOpen },
  { to: '/tests', label: 'Mock Tests', icon: ClipboardList },
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/mistakes', label: 'Mistake Notebook', icon: BrainCircuit },
  { to: '/study-plan', label: 'Study Planner', icon: CalendarCheck2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/mentor', label: 'AI Mentor', icon: Bot },
];

const bottomNavItems = [
  { to: '/settings', label: 'Settings', icon: Settings },
];

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -15, scale: 1.01, transition: { duration: 0.3, ease: "easeIn" } }
};

const AppShell = ({ children, hideSearch = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden font-sans text-gray-900">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Dark Premium (#0F172A) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-sidebar text-slate-300 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative border-r border-slate-800`}>
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          
          <div className="flex items-center justify-between mb-10 px-4">
            <button className="flex items-center gap-2 group" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white shadow-glow transition-transform group-hover:scale-110">
                <BrainCircuit size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Solnut
              </span>
            </button>
            <button className="lg:hidden p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors" onClick={() => setMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="px-4 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>

          <nav className="space-y-1" aria-label="Student navigation">
            {[...navItems, ...(user?.role === 'admin'
              ? [{ to: '/admin/questions', label: 'Question Import', icon: FileUp }]
              : [])].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium group relative overflow-hidden ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Icon size={20} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-primary" : "text-slate-400"}`} />
                    <span className="relative z-10">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <nav className="space-y-1 mb-4">
            {bottomNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Sticky Top Navbar */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors" onClick={() => setMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            {!hideSearch && (
              <div className="hidden md:flex items-center relative group">
                <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search questions, chapters, or commands..." 
                  className="pl-11 pr-4 py-2.5 w-80 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all"
                />
                <div className="absolute right-3 flex items-center gap-1 opacity-50">
                  <kbd className="font-mono text-xs bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5">⌘</kbd>
                  <kbd className="font-mono text-xs bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5">K</kbd>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Gamification Stats */}
            <div className="hidden sm:flex items-center gap-4 mr-2">
              <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
                <Flame size={16} className="fill-orange-500" />
                12 Day Streak
              </div>
              <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-bold text-sm border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                <Zap size={16} className="fill-purple-500" />
                Lvl 24
              </div>
            </div>

            <button className="p-2.5 text-slate-500 hover:bg-slate-200 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            </button>

            <button className="p-2.5 text-slate-500 hover:bg-slate-200 rounded-full transition-colors hidden sm:block">
              <Moon size={20} />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                  {user?.firstName?.[0] || 'S'}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold leading-tight">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Aspirant'}</div>
                <div className="text-xs text-slate-500 font-medium">Free Plan</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppShell;
