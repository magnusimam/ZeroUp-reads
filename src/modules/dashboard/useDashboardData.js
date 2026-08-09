import { useMemo, useState } from 'react';
import * as booksService from '../books/booksService';
import * as userService from '../../services/userService';
import * as settingsService from '../settings/settingsService';
import useContinueReading from '../reading/useContinueReading';
import { computeAchievements, computeReaderLevel } from './achievements';
import { computeGenreBreakdown } from './genreBreakdown';
import { CONTINUE_JOURNEY_MAX_CARDS, DASHBOARD_RECENTLY_READ_COUNT, READING_MINUTES_PER_PAGE } from '../../config/rules';

// All Reader Dashboard business logic (which books to show where, streak,
// achievements, search, stats/chart data) lives here instead of inline in
// DashboardPage's JSX (Separation of Concerns) — the page and its section
// components stay presentational and just render what this hook hands them.
export default function useDashboardData() {
  const [search, setSearch] = useState('');

  // Re-reads from the same services every other module reads from (booksService,
  // userService) rather than keeping a dashboard-local copy of book/progress
  // data (Modular Architecture — one source of truth per domain).
  const [books] = useState(() => booksService.getBooks());
  const progress = userService.getProgress();

  const continueReading = useContinueReading(books).slice(0, CONTINUE_JOURNEY_MAX_CARDS);

  const achievements = useMemo(() => computeAchievements(progress), [progress]);
  const preferredLanguage = settingsService.getSettings().preferredLanguage;

  // Most-recently-finished books first — completedBookIds is appended to in
  // completion order (see userService.js's book.completed subscriber), so
  // reversing it is a real chronological "recently read", not a guess.
  const recentlyRead = useMemo(() => (
    [...(progress.completedBookIds || [])]
      .reverse()
      .slice(0, DASHBOARD_RECENTLY_READ_COUNT)
      .map((id) => booksService.getBook(id))
      .filter(Boolean)
  ), [progress.completedBookIds]);

  // "Top Genres" — real category mix of every book this reader is currently
  // in or has finished, not a fabricated demo split.
  const genreBreakdown = useMemo(() => {
    const completedBooks = (progress.completedBookIds || []).map((id) => booksService.getBook(id)).filter(Boolean);
    const categories = [...continueReading, ...completedBooks].map((b) => b.category);
    return computeGenreBreakdown(categories);
  }, [continueReading, progress.completedBookIds]);

  // Not memoized — `progress` itself is a fresh object every render (read
  // straight from localStorage above, same as every other field derived
  // from it here), so a useMemo wrapper would buy nothing.
  const weeklyActivity = userService.getWeeklyActivity();

  const stats = useMemo(() => {
    const hoursRead = Math.round((progress.pagesRead || 0) * READING_MINUTES_PER_PAGE / 6) / 10;
    const hoursReadThisWeek = Math.round(weeklyActivity.reduce((sum, d) => sum + d.hours, 0) * 10) / 10;
    return {
      booksCompleted: progress.booksCompleted || 0,
      booksCompletedThisWeek: progress.booksCompletedThisWeek || 0,
      hoursRead,
      hoursReadThisWeek,
      streak: progress.streak || 0,
      achievementsUnlocked: achievements.filter((a) => a.achieved).length,
    };
  }, [progress, weeklyActivity, achievements]);

  const readerLevel = useMemo(() => computeReaderLevel(progress), [progress]);

  return {
    books,
    continueReading,
    progress,
    achievements,
    search,
    setSearch,
    preferredLanguage,
    recentlyRead,
    genreBreakdown,
    weeklyActivity,
    stats,
    readerLevel,
    notificationCount: continueReading.length,
  };
}
