import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3,
  BookMarked,
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
} from 'lucide-react';
import { logout } from '../store/slices/userSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/question-bank', label: 'Question bank', icon: BookOpen },
  { to: '/tests', label: 'Tests', icon: ClipboardList },
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/study-plan', label: 'Study plan', icon: CalendarCheck2 },
  { to: '/mistakes', label: 'Mistake notebook', icon: BookMarked },
  { to: '/attempts', label: 'Attempt history', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const AppShell = ({ children, title, eyebrow, actions, hideSearch = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="student-shell">
      {menuOpen && (
        <button
          className="student-shell-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`student-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div>
          <div className="student-brand-row">
            <button className="student-brand" onClick={() => navigate('/dashboard')}>Solnut</button>
            <button className="student-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <nav className="student-nav" aria-label="Student navigation">
            {[...navItems, ...(user?.role === 'admin'
              ? [{ to: '/admin/questions', label: 'Question import', icon: FileUp }]
              : [])].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `student-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="student-sidebar-footer">
          <div className="student-avatar">{user?.firstName?.[0] || 'S'}</div>
          <div className="student-user-copy">
            <strong>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'NEET aspirant'}</strong>
            <span>{user?.email || 'Your study workspace'}</span>
          </div>
          <button className="student-icon-button" onClick={handleLogout} aria-label="Log out" title="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="student-main">
        <header className="student-topbar">
          <button className="student-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div>
            {eyebrow && <p className="student-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
          {!hideSearch && (
            <div className="shell-search" onClick={() => navigate('/question-bank')}>
              <Search size={15} />
              <input aria-label="Search" placeholder="Search chapters and questions" readOnly />
            </div>
          )}
          <div className="student-topbar-actions">{actions}</div>
        </header>
        <main className="student-content">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
