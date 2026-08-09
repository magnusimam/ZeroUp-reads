import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './modules/auth/RegisterPage';
import LoginPage from './modules/auth/LoginPage';
import ForgotPasswordPage from './modules/auth/ForgotPasswordPage';
import CheckEmailPage from './modules/auth/CheckEmailPage';
import ResetPasswordPage from './modules/auth/ResetPasswordPage';
import PasswordResetSuccessPage from './modules/auth/PasswordResetSuccessPage';
import LibraryPage from './modules/library/LibraryPage';
import BookDetailPage from './modules/books/BookDetailPage';
import ReadingPage from './modules/reading/ReadingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './modules/dashboard/DashboardPage';
import SettingsPage from './modules/settings/SettingsPage';
import AdminCMSPage from './modules/admin/AdminCMSPage';
import AnalyticsPage from './modules/analytics/AnalyticsPage';
import SupportTicketsPage from './modules/admin/SupportTicketsPage';
import UserManagementPage from './modules/admin/UserManagementPage';
import HelpCenterPage from './modules/help/HelpCenterPage';
import ContactSupportPage from './modules/help/ContactSupportPage';
import ReportProblemPage from './modules/help/ReportProblemPage';
import SuggestBookPage from './modules/help/SuggestBookPage';
import FeedbackPage from './modules/help/FeedbackPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './modules/onboarding/OnboardingPage';
import OfflinePage from './pages/OfflinePage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Context
import { AuthProvider } from './modules/auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import OfflineBanner from './components/OfflineBanner';
import RequireRole from './components/RequireRole';
import { ROLES, PUBLISHING_ROLES, TRANSLATION_ROLES } from './config/roles';
import PublishingDashboardPage from './modules/publishing/PublishingDashboardPage';
import NewDraftPage from './modules/publishing/NewDraftPage';
import SubmissionDetailPage from './modules/publishing/SubmissionDetailPage';
import TranslationHubPage from './modules/translation/TranslationHubPage';
import TranslationWorkspacePage from './modules/translation/TranslationWorkspacePage';
import DownloadsPage from './modules/reading/DownloadsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <OfflineBanner />
            <Routes>
              <Route path="/"                  element={<HomePage />} />
              <Route path="/register"          element={<RegisterPage />} />
              <Route path="/login"             element={<LoginPage />} />
              <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
              <Route path="/check-email"       element={<CheckEmailPage />} />
              <Route path="/reset-password/success" element={<PasswordResetSuccessPage />} />
              <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
              <Route path="/library"           element={<LibraryPage />} />
              <Route path="/book/:bookId"      element={<BookDetailPage />} />
              <Route path="/read/:bookId"      element={<ReadingPage />} />
              <Route path="/downloads"         element={<DownloadsPage />} />
              <Route path="/profile"           element={<ProfilePage />} />
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/settings"          element={<SettingsPage />} />
              <Route path="/admin"             element={<RequireRole allow={[ROLES.ADMINISTRATOR]}><AdminCMSPage /></RequireRole>} />
              <Route path="/admin/analytics"   element={<RequireRole allow={[ROLES.ADMINISTRATOR]}><AnalyticsPage /></RequireRole>} />
              <Route path="/admin/support"     element={<RequireRole allow={[ROLES.ADMINISTRATOR]}><SupportTicketsPage /></RequireRole>} />
              <Route path="/admin/users"       element={<RequireRole allow={[ROLES.ADMINISTRATOR]}><UserManagementPage /></RequireRole>} />
              <Route path="/help"                    element={<HelpCenterPage />} />
              <Route path="/help/contact"            element={<ContactSupportPage />} />
              <Route path="/help/report-a-problem"   element={<ReportProblemPage />} />
              <Route path="/help/suggest-a-book"     element={<SuggestBookPage />} />
              <Route path="/help/feedback"           element={<FeedbackPage />} />
              <Route path="/publishing"        element={<RequireRole allow={PUBLISHING_ROLES}><PublishingDashboardPage /></RequireRole>} />
              <Route path="/publishing/new"    element={<RequireRole allow={PUBLISHING_ROLES}><NewDraftPage /></RequireRole>} />
              <Route path="/publishing/:id"    element={<RequireRole allow={PUBLISHING_ROLES}><SubmissionDetailPage /></RequireRole>} />
              <Route path="/translate"                    element={<RequireRole allow={TRANSLATION_ROLES}><TranslationHubPage /></RequireRole>} />
              <Route path="/translate/:bookId/:language"  element={<RequireRole allow={TRANSLATION_ROLES}><TranslationWorkspacePage /></RequireRole>} />
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
