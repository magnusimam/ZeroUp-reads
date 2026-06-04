import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import ReadingPage from './pages/ReadingPage';
import ProfilePage from './pages/ProfilePage';
import AdminCMSPage from './pages/AdminCMSPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';
import OfflinePage from './pages/OfflinePage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
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
  );
}

export default App;
