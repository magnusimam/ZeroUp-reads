import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../modules/auth/AuthContext';
import useProfileData from '../modules/profile/useProfileData';
import ProfileHero from '../modules/profile/components/ProfileHero';
import ProfileCard from '../modules/profile/components/ProfileCard';
import ProfileTabs from '../modules/profile/components/ProfileTabs';
import OverviewTab from '../modules/profile/components/OverviewTab';
import MyBooksTab from '../modules/profile/components/MyBooksTab';
import BookmarksTab from '../modules/profile/components/BookmarksTab';
import ActivityTab from '../modules/profile/components/ActivityTab';
import AchievementsTab from '../modules/profile/components/AchievementsTab';
import SettingsTab from '../modules/profile/components/SettingsTab';
import ProfileCTA from '../modules/profile/components/ProfileCTA';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const {
    activeTab, setActiveTab,
    progress, achievements,
    continueReadingBooks, bookmarkedBooks, completedBooks,
    genreBreakdown, weeklyActivity,
    settings, updateSettings,
    onboardingPrefs, currentTier,
    nextBookAchievement, booksToNextAchievement,
  } = useProfileData();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-cream)' }}>
      <Navbar />

      <ProfileHero />
      <ProfileCard user={user} progress={progress} bookmarkCount={bookmarkedBooks.length} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="max-w-content mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            progress={progress}
            currentTier={currentTier}
            nextBookAchievement={nextBookAchievement}
            booksToNextAchievement={booksToNextAchievement}
            continueReadingBooks={continueReadingBooks}
            achievements={achievements}
            bookmarkedBooks={bookmarkedBooks}
            settings={settings}
            onboardingPrefs={onboardingPrefs}
            onSwitchTab={setActiveTab}
          />
        )}
        {activeTab === 'books' && (
          <MyBooksTab continueReadingBooks={continueReadingBooks} completedBooks={completedBooks} />
        )}
        {activeTab === 'bookmarks' && <BookmarksTab bookmarkedBooks={bookmarkedBooks} />}
        {activeTab === 'activity' && <ActivityTab weeklyActivity={weeklyActivity} genreBreakdown={genreBreakdown} />}
        {activeTab === 'achievements' && <AchievementsTab achievements={achievements} />}
        {activeTab === 'settings' && (
          <SettingsTab settings={settings} updateSettings={updateSettings} onboardingPrefs={onboardingPrefs} onLogout={handleLogout} />
        )}
      </main>

      <ProfileCTA />

      <Footer />
    </div>
  );
}
