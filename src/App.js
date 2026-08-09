import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './modules/auth/RegisterPage';
import LoginPage from './modules/auth/LoginPage';
import LibraryPage from './modules/library/LibraryPage';
import ReadingPage from './modules/reading/ReadingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './modules/dashboard/DashboardPage';
import SettingsPage from './modules/settings/SettingsPage';
import AdminCMSPage from './modules/admin/AdminCMSPage';
import AnalyticsPage from './modules/analytics/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';
import OfflinePage from './pages/OfflinePage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Context
import { AuthProvider } from './modules/auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"                  element={<HomePage />} />
              <Route path="/register"          element={<RegisterPage />} />
              <Route path="/login"             element={<LoginPage />} />
              <Route path="/library"           element={<LibraryPage />} />
              <Route path="/read/:bookId"      element={<ReadingPage />} />
              <Route path="/profile"           element={<ProfilePage />} />
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/settings"          element={<SettingsPage />} />
              <Route path="/admin"             element={<AdminCMSPage />} />
              <Route path="/admin/analytics"   element={<AnalyticsPage />} />
              <Route path="/about"             element={<AboutPage />} />
              <Route path="/welcome"           element={<OnboardingPage />} />
              <Route path="/offline"           element={<OfflinePage />} />
              <Route path="/privacy"           element={<PrivacyPage />} />
              <Route path="/terms"             element={<TermsPage />} />
              <Route path="*"                  element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
