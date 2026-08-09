import { MOCK_USER } from '../utils/mockData';
import * as eventBus from '../utils/eventBus';
import * as booksService from '../modules/books/booksService';
import * as syncService from '../modules/reading/syncService';
import { READING_MINUTES_PER_PAGE, READING_POINTS_PER_PAGE, WEEKDAY_LABELS } from '../config/rules';

const PROGRESS_KEY = 'zeroup_reading_progress';

// Monday (ISO) of the week a given date falls in — the anchor `weeklyActivity`
// is keyed against, so the Reading Progress chart always resets on week
// boundaries instead of drifting as a rolling 7-day window.
function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// One-time demo seed for a brand-new reader's weekly chart — same idea as
// MOCK_USER.dayStreak/pagesRead already being seeded numbers that then
// evolve from real reading events, not a value the chart stays pinned to.
// Kept well under MOCK_USER.pagesRead's derived lifetime hoursRead (~7.1h at
// READING_MINUTES_PER_PAGE) so the dashboard's "this week" stat can never
// read as larger than "all time" on a fresh seed.
const SEED_WEEKLY_ACTIVITY = [0.3, 0.6, 1.2, 0.8, 0.3, 0.1, 0.5];

function readProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = {
    booksCompleted: MOCK_USER.booksCompleted,
    pagesRead: MOCK_USER.pagesRead,
    completedBookIds: MOCK_USER.completed.map((book) => book.id),
    streak: MOCK_USER.dayStreak,
    lastReadDate: null,
    weekStart: mondayOf(new Date()),
    weeklyActivity: SEED_WEEKLY_ACTIVITY,
    booksCompletedThisWeek: 2,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(seed));
  return seed;
}

function writeProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Rolls `weeklyActivity`/`booksCompletedThisWeek` over to a fresh Mon-Sun
// week whenever the persisted `weekStart` has gone stale, then adds
// `hoursDelta` to today's bucket. Shared by recordProgress (per page-turn)
// and the book.completed subscriber (per finished book) so both read/write
// the same weekly-rollover logic instead of each growing its own copy.
function bumpWeeklyActivity(progress, hoursDelta) {
  const currentWeekStart = mondayOf(new Date());
  const stale = progress.weekStart !== currentWeekStart;
  const weeklyActivity = stale ? [0, 0, 0, 0, 0, 0, 0] : [...(progress.weeklyActivity || [0, 0, 0, 0, 0, 0, 0])];
  const booksCompletedThisWeek = stale ? 0 : (progress.booksCompletedThisWeek || 0);

  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6
  weeklyActivity[todayIndex] = Math.round((weeklyActivity[todayIndex] + hoursDelta) * 10) / 10;

  return { ...progress, weekStart: currentWeekStart, weeklyActivity, booksCompletedThisWeek };
}

// Reading-streak logic lives here (not in the dashboard) because it's derived
// from the same reading-activity signal recordProgress already receives —
// keeping it in one service avoids a second, dashboard-only copy of "when did
// this reader last read" (Modular Architecture — single source of truth).
function bumpStreak(progress) {
  const today = todayKey();
  if (progress.lastReadDate === today) return progress;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = progress.lastReadDate === yesterday ? (progress.streak || 0) + 1 : 1;
  const updated = { ...progress, streak: nextStreak, lastReadDate: today };
  eventBus.emit('streak.updated', { streak: nextStreak });
  return updated;
}

export function getProgress() {
  return readProgress();
}

// ReaderSidebar's "Reading Points" stat — a simple derived multiple of pages
// actually read, not a separately-persisted counter, so it can never drift
// out of sync with pagesRead the way two independently-tracked totals could.
export function getReadingPoints() {
  return Math.round(readProgress().pagesRead * READING_POINTS_PER_PAGE);
}

// Reader Dashboard's "Reading Progress" bar chart — last persisted Mon-Sun
// week, labelled and ready to render, so the chart component doesn't touch
// raw progress internals (Separation of Concerns).
export function getWeeklyActivity() {
  const progress = readProgress();
  const hours = progress.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];
  return WEEKDAY_LABELS.map((label, i) => ({ label, hours: hours[i] || 0 }));
}

// Persists real per-book page position so "Continue Reading" reflects what a
// reader actually opened, instead of the homepage fabricating two books as
// "in progress" for every logged-in user regardless of their real history.
export function recordProgress(bookId, currentPage, totalPages) {
  if (!navigator.onLine) syncService.markPendingSync();

  let progress = bumpStreak(readProgress());
  progress = bumpWeeklyActivity(progress, READING_MINUTES_PER_PAGE / 60);
  if (progress.completedBookIds.includes(bookId)) return writeProgress(progress);

  return writeProgress({
    ...progress,
    inProgress: { ...(progress.inProgress || {}), [bookId]: { currentPage, totalPages } },
  });
}

// Real subscriber (Principle 5 — Event-Driven Architecture): finishing a book
// in ReadingPage now actually updates the reader's persisted progress instead
// of that logic living inline in the page, and instead of MOCK_USER staying
// a frozen snapshot forever.
eventBus.on('book.completed', ({ id }) => {
  const progress = readProgress();
  if (progress.completedBookIds.includes(id)) return;

  const book = booksService.getBook(id);
  const { [id]: _finished, ...stillInProgress } = progress.inProgress || {};
  const withWeek = bumpWeeklyActivity(progress, 0);
  writeProgress({
    ...withWeek,
    booksCompleted: progress.booksCompleted + 1,
    pagesRead: progress.pagesRead + (book?.totalPages || 0),
    completedBookIds: [...progress.completedBookIds, id],
    booksCompletedThisWeek: withWeek.booksCompletedThisWeek + 1,
    inProgress: stillInProgress,
  });
});
