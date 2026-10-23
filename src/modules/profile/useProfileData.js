import { useMemo, useState } from 'react';
import * as booksService from '../books/booksService';
import * as userService from '../../services/userService';
import * as bookmarksService from '../reading/bookmarksService';
import * as offlineService from '../reading/offlineService';
import * as settingsService from '../settings/settingsService';
import * as onboardingService from '../onboarding/onboardingService';
import useContinueReading from '../reading/useContinueReading';
import { computeAchievements, computeReaderLevel } from '../dashboard/achievements';
import { computeGenreBreakdown } from '../dashboard/genreBreakdown';
import { READING_LEVELS } from '../../components/home/discover/discoverConfig';

export const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'books', label: 'My Books', icon: '📖' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
  { id: 'activity', label: 'Reading Activity', icon: '📊' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// Deep links from the Reader Dashboard ("Favourites" → /profile#bookmarks,
// "Recently Read › See all" → /profile#completed) open the matching tab
// instead of duplicating either list on a second page.
const HASH_TO_TAB = { bookmarks: 'bookmarks', completed: 'books' };

function getInitialTab() {
  const hash = window.location.hash.slice(1);
  if (HASH_TO_TAB[hash]) return HASH_TO_TAB[hash];
  return PROFILE_TABS.some(t => t.id === hash) ? hash : 'overview';
}

// All My Profile business logic (real stats, achievements, bookmarks,
// preferences) in one place so ProfilePage and its tab components stay
// presentational (Separation of Concerns) — reuses the exact same services
// the Reader Dashboard already reads from (userService, bookmarksService,
// achievements.js) rather than a second, profile-local copy of any of it
// (Modular Architecture: one source of truth per domain).
export default function useProfileData() {
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [books] = useState(() => booksService.getBooks());
  const progress = userService.getProgress();
  const achievements = useMemo(() => computeAchievements(progress), [progress]);
  const readerLevel = computeReaderLevel(progress);

  const continueReadingBooks = useContinueReading(books);
  const bookmarkIds = bookmarksService.getBookmarks();
  const bookmarkedBooks = useMemo(
    () => books.filter(b => bookmarkIds.includes(b.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [books, bookmarkIds.join(',')]
  );
  const completedBooks = useMemo(
    () => (progress.completedBookIds || []).map(id => booksService.getBook(id)).filter(Boolean),
    [progress.completedBookIds]
  );

  const genreBreakdown = useMemo(() => {
    const categories = [...continueReadingBooks, ...completedBooks].map(b => b.category);
    return computeGenreBreakdown(categories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continueReadingBooks.length, completedBooks.length]);
  const weeklyActivity = userService.getWeeklyActivity();

  const downloadedCount = offlineService.getDownloadedBooks().length;

  const [settings, setSettingsState] = useState(() => settingsService.getSettings());
  function updateSettings(patch) {
    setSettingsState(settingsService.saveSettings(patch));
  }

  const onboardingPrefs = onboardingService.getPreferences();
  const currentTierIndex = Math.max(0, READING_LEVELS.findIndex(t => t.key === onboardingPrefs.ageGroupKey));
  const currentTier = READING_LEVELS[currentTierIndex] || READING_LEVELS[0];
  const nextTier = READING_LEVELS[currentTierIndex + 1] || null;

  // The "keep going" nudge on the Overview tab — the next achievement this
  // reader hasn't unlocked yet that's actually measured in books completed,
  // so the "X more books" delta is a real number, not an invented one.
  const nextBookAchievement = achievements.find(a => !a.achieved && a.metric === 'booksCompleted');
  const booksToNextAchievement = nextBookAchievement
    ? Math.max(0, nextBookAchievement.threshold - (progress.booksCompleted || 0))
    : 0;

  return {
    activeTab, setActiveTab,
    books, progress, achievements, readerLevel,
    continueReadingBooks, bookmarkedBooks, completedBooks,
    genreBreakdown, weeklyActivity,
    downloadedCount,
    settings, updateSettings,
    onboardingPrefs, currentTier, nextTier,
    nextBookAchievement, booksToNextAchievement,
  };
}
