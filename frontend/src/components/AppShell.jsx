import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarCheck2,
  Check,
  ChevronRight,
  ClipboardList,
  FileUp,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Trophy,
  TrendingUp,
  ShieldCheck,
  User,
  X,
  Zap,
} from 'lucide-react';
import { logout } from '../store/slices/userSlice';

const primaryNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Your daily overview' },
  { to: '/question-bank', label: 'Question Bank', icon: BookOpen, hint: 'Browse NEET questions' },
  { to: '/pyq', label: 'PYQ Intelligence', icon: TrendingUp, hint: 'Explore 10-year trends and practice' },
  { to: '/tests', label: 'Mock Tests', icon: ClipboardList, hint: 'Build a practice test' },
  { to: '/performance', label: 'Performance', icon: BarChart3, hint: 'Review your analytics' },
  { to: '/mistakes', label: 'Mistake Notebook', icon: BrainCircuit, hint: 'Revise weak concepts' },
  { to: '/study-plan', label: 'Study Planner', icon: CalendarCheck2, hint: 'Plan your preparation' },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, hint: 'See your current rank' },
  { to: '/mentor', label: 'AI Mentor', icon: Bot, hint: 'Ask a doubt in Hinglish' },
];

const utilityItems = [
  { to: '/attempts', label: 'Past Attempts', icon: ClipboardList, hint: 'Open previous test reports' },
  { to: '/settings', label: 'Settings', icon: Settings, hint: 'Manage your profile' },
];

const notifications = [
  { id: 1, title: 'Daily practice is ready', copy: 'Start a 30-question Biology drill.', to: '/tests', tone: 'bg-blue-100 text-blue-600' },
  { id: 2, title: 'Revision reminder', copy: 'You have saved mistakes waiting for review.', to: '/mistakes', tone: 'bg-amber-100 text-amber-600' },
  { id: 3, title: 'Study plan updated', copy: 'Open today\'s focused revision plan.', to: '/study-plan', tone: 'bg-emerald-100 text-emerald-600' },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
  out: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

const AppShell = ({ children, hideSearch = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const allNavItems = useMemo(() => {
    const adminItem = user?.role === 'admin'
      ? [{ to: '/admin/questions', label: 'Question Import', icon: FileUp, hint: 'Review and publish questions' }, { to: '/admin/pyq', label: 'PYQ Quality', icon: ShieldCheck, hint: 'Validate imports and reports' }]
      : [];
    return [...primaryNavItems, ...utilityItems, ...adminItem];
  }, [user?.role]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allNavItems;
    return allNavItems.filter(({ label, hint }) => `${label} ${hint}`.toLowerCase().includes(query));
  }, [allNavItems, searchQuery]);

  const activePage = allNavItems.find(({ to }) => location.pathname === to)
    || (location.pathname.startsWith('/pyq') ? { label: 'PYQ Intelligence' } : null)
    || (location.pathname.startsWith('/exam/') ? { label: 'Live Exam' } : null)
    || (location.pathname.startsWith('/results/') ? { label: 'Test Results' } : null);

  const unreadCount = notifications.filter(({ id }) => !readNotifications.includes(id)).length;
  const firstName = user?.firstName || 'Aspirant';
  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || ''}`.toUpperCase();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const goTo = (path) => {
    setSearchQuery('');
    navigate(path);
  };

  const openNotifications = () => {
    setNotificationOpen((current) => !current);
    setProfileOpen(false);
  };

  const markAllRead = () => setReadNotifications(notifications.map(({ id }) => id));

  return (
    <div className="flex min-h-screen overflow-hidden bg-background font-sans text-slate-900">
      <AnimatePresence>
        {menuOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-sidebar text-slate-300 transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative`}>
        <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
          <div className="mb-9 flex items-center justify-between px-3">
            <button type="button" className="group flex items-center gap-3" onClick={() => navigate('/dashboard')}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 text-white shadow-lg shadow-blue-950/40 transition-transform group-hover:rotate-3 group-hover:scale-105">
                <BrainCircuit size={22} />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">Medical Mania</span>
            </button>
            <button type="button" aria-label="Close menu" className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" onClick={() => setMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Prepare</p>
          <nav className="space-y-1" aria-label="Student navigation">
            {primaryNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="activeNav" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-400" />}
                    <Icon size={19} className="transition-transform group-hover:scale-110" />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin/questions" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <FileUp size={19} /> Question Import
                </NavLink>
                <NavLink to="/admin/pyq" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <ShieldCheck size={19} /> PYQ Quality
                </NavLink>
              </>
            )}
          </nav>

          <button type="button" onClick={() => navigate('/study-plan')} className="group relative mt-7 w-full overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-left shadow-xl">
            <span className="absolute -right-5 -top-6 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl" />
            <span className="mb-3 flex items-center justify-between text-xs font-bold text-blue-300">
              TODAY'S FOCUS <Zap size={15} />
            </span>
            <span className="block text-sm font-bold text-white">Complete your daily plan</span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-700">
              <motion.span initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 0.8, delay: 0.2 }} className="block h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400" />
            </span>
            <span className="mt-2 block text-xs text-slate-400">68% of today's goal</span>
          </button>
        </div>

        <div className="border-t border-slate-800 p-4">
          <NavLink to="/settings" className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Settings size={19} /> Settings
          </NavLink>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400">
            <LogOut size={19} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)}>
              <Menu size={23} />
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="text-xs font-semibold text-slate-400">Workspace</p>
              <h2 className="truncate text-base font-extrabold text-slate-800">{activePage?.label || 'Medical Mania'}</h2>
            </div>
            {!hideSearch && (
              <button type="button" onClick={() => setSearchOpen(true)} className="ml-0 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-white sm:ml-4 sm:w-72 sm:px-4">
                <Search size={18} />
                <span className="hidden flex-1 sm:block">Search or jump to...</span>
                <kbd className="hidden rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-400 sm:block">Ctrl K</kbd>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600 md:flex">
              <Flame size={16} className="fill-orange-500" /> 12 day streak
            </div>

            <div className="relative">
              <button type="button" aria-label="Notifications" onClick={openNotifications} className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unreadCount}</span>}
              </button>
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} className="absolute right-0 top-14 z-50 w-[min(92vw,23rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                      <div><h3 className="font-extrabold text-slate-900">Notifications</h3><p className="text-xs text-slate-500">{unreadCount} unread updates</p></div>
                      <button type="button" onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all read</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {notifications.map((item) => {
                        const isRead = readNotifications.includes(item.id);
                        return (
                          <button type="button" key={item.id} onClick={() => { setReadNotifications((current) => [...new Set([...current, item.id])]); navigate(item.to); }} className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${isRead ? 'opacity-60' : ''}`}>
                            <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.tone}`}><Bell size={16} /></span>
                            <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-800">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{item.copy}</span></span>
                            {!isRead && <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button type="button" onClick={() => { setProfileOpen((current) => !current); setNotificationOpen(false); }} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100 sm:pr-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-md">{initials}</span>
                <span className="hidden text-left md:block"><span className="block text-sm font-bold leading-tight text-slate-800">{firstName}</span><span className="block text-[11px] font-medium text-slate-500">NEET aspirant</span></span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
                    <div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-bold text-slate-800">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'NEET Aspirant'}</p><p className="truncate text-xs text-slate-500">{user?.email || 'Student account'}</p></div>
                    <button type="button" onClick={() => navigate('/settings')} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600"><User size={17} /> Profile & settings</button>
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"><LogOut size={17} /> Sign out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial="initial" animate="in" exit="out" variants={pageVariants} className="min-h-full pb-20 lg:pb-0">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-2xl shadow-slate-900/20 backdrop-blur-xl lg:hidden" aria-label="Quick navigation">
        {[primaryNavItems[0], primaryNavItems[2], primaryNavItems[4], primaryNavItems[7]].map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
            <Icon size={19} /><span>{label.replace(' Notebook', '')}</span>
          </NavLink>
        ))}
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/55 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}>
            <motion.div initial={{ opacity: 0, y: -16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <Search className="text-blue-600" size={21} />
                <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search pages and features..." className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:ring-0" />
                <button type="button" onClick={() => setSearchOpen(false)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-400">ESC</button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto p-3">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Quick navigation</p>
                {filteredItems.length ? filteredItems.map(({ to, label, hint, icon: Icon }) => (
                  <button type="button" key={to} onClick={() => goTo(to)} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-blue-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white"><Icon size={19} /></span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-800">{label}</strong><span className="block truncate text-xs text-slate-500">{hint}</span></span>
                    {location.pathname === to ? <Check size={17} className="text-emerald-500" /> : <ChevronRight size={17} className="text-slate-300 group-hover:text-blue-500" />}
                  </button>
                )) : <div className="px-5 py-10 text-center"><Search className="mx-auto mb-3 text-slate-300" size={30} /><p className="font-bold text-slate-700">No matching page</p><p className="mt-1 text-sm text-slate-500">Try dashboard, tests, mentor, or settings.</p></div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
