import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import AttemptsPage from './pages/AttemptsPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import MistakesPage from './pages/MistakesPage';
import QuestionBankPage from './pages/QuestionBankPage';
import TestsPage from './pages/TestsPage';
import PerformancePage from './pages/PerformancePage';
import StudyPlanPage from './pages/StudyPlanPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MentorPage from './pages/MentorPage';
import PyqHubPage from './pages/PyqHubPage';
import PyqAdminPage from './pages/PyqAdminPage';
import { authAPI } from './services/api';
import { setUser } from './store/slices/userSlice';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FloatingChat from './components/FloatingChat';

function App() {
  const { isAuthenticated } = useSelector(state => state.user);
  const user = useSelector(state => state.user.user);
  const isAdmin = user?.role === 'admin';
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && !user) {
      authAPI.getCurrentUser()
        .then((response) => dispatch(setUser(response.data)))
        .catch(() => {});
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated && user ? <Navigate to={isAdmin ? '/admin/questions' : '/dashboard'} /> : <LoginPage />} />
        <Route path="/admin/login" element={isAuthenticated && user ? <Navigate to={isAdmin ? '/admin/questions' : '/dashboard'} /> : <AdminLoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exam/:testId" element={<ExamPage />} />
          <Route path="/results/:attemptId" element={<ResultsPage />} />
          <Route path="/attempts" element={<AttemptsPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/question-bank" element={<QuestionBankPage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/study-plan" element={<StudyPlanPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/mentor" element={<MentorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/pyq" element={<PyqHubPage view="explorer" />} />
          <Route path="/pyq/trends" element={<PyqHubPage view="trends" />} />
          <Route path="/pyq/papers" element={<PyqHubPage view="papers" />} />
          <Route path="/pyq/performance" element={<PyqHubPage view="performance" />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/pyq" element={<PyqAdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
      </Routes>
      {isAuthenticated && <FloatingChat />}
    </Router>
  );
}

export default App;
