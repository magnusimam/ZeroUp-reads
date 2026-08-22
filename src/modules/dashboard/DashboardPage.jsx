import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import useDashboardData from './useDashboardData';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardTopBar from './components/DashboardTopBar';
import DashboardHero from './components/DashboardHero';
import StatsGrid from './components/StatsGrid';
import ReadingProgressChart from './components/ReadingProgressChart';
import TopGenresChart from './components/TopGenresChart';
import RecentlyReadSection from './components/RecentlyReadSection';
import ContinueJourneySection from './components/ContinueJourneySection';
import CategoryExplorer from './components/CategoryExplorer';
import DashboardCTA from './components/DashboardCTA';

// Reader Dashboard — shown only to authenticated users (redirects to /login
// otherwise, same guard ProfilePage uses) and never replaces the public
// homepage at "/". It's a self-contained app shell (own sidebar + top bar)
// rather than the marketing site's Navbar/Footer, matching the product's
// dashboard reference design. Page stays presentational; all data/business
// logic lives in useDashboardData (Separation of Concerns).
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Sidebar items deep-link to #categories/#progress on this same page —
  // Link alone won't scroll there on a same-route navigation, so do it
  // manually.
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const {
    continueReading, search, setSearch, preferredLanguage,
    recentlyRead, genreBreakdown, weeklyActivity, stats, readerLevel,
    notifications, notificationCount, onMarkAllNotificationsRead,
  } = useDashboardData();

  if (!user) return null;

  const firstName = (user.name || 'Reader').split(' ')[0];

  return (
    <div id="top" className="dashboard-shell" style={{ background: 'var(--hero-cream)', minHeight: '100vh', display: 'flex', gap: 24, padding: 24 }}>
      <DashboardSidebar streak={stats.streak} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <DashboardTopBar
          search={search} onSearchChange={setSearch} preferredLanguage={preferredLanguage}
          user={user} readerLevel={readerLevel}
          notifications={notifications} notificationCount={notificationCount}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        />

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <DashboardHero firstName={firstName} continueBook={continueReading[0]} />
            <div id="progress">
              <StatsGrid stats={stats} />
            </div>
            <ContinueJourneySection books={continueReading} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ReadingProgressChart weeklyActivity={weeklyActivity} />
            <TopGenresChart genreBreakdown={genreBreakdown} />
            <RecentlyReadSection books={recentlyRead} />
          </div>
        </div>

        <CategoryExplorer />
        <DashboardCTA />
      </main>

      <style>{`
        @media (max-width: 1100px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .dashboard-shell { flex-direction: column; padding: 16px !important; }
          .dashboard-sidebar { width: 100% !important; position: static !important; }
          .hidden-mobile-account { display: none !important; }
        }
      `}</style>
    </div>
  );
}
