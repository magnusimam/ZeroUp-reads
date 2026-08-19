import { READING_MINUTES_PER_PAGE, READING_POINTS_PER_PAGE } from "../config/rules";

export type UserStatsRow = {
  user_id: string;
  books_completed: number;
  pages_read: number;
  streak: number;
  last_read_date: string | null;
  week_start: string | null;
  weekly_activity: string;
  books_completed_this_week: number;
};

export type ReadingProgressRow = {
  book_id: string;
  current_page: number;
  total_pages: number;
  completed: number;
  completed_at: string | null;
  updated_at: string;
};

// Monday (ISO, YYYY-MM-DD) of the week a given date falls in — mirrors the
// frontend's userService.js mondayOf(), the anchor weekly_activity is keyed
// against so the reading-progress chart resets on week boundaries instead of
// drifting as a rolling 7-day window.
export function mondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Mirrors userService.js's bumpStreak() — a no-op if already recorded today,
// +1 if the last read day was yesterday, reset to 1 otherwise.
function nextStreakState(streak: number, lastReadDate: string | null, today: string) {
  if (lastReadDate === today) return { streak, lastReadDate };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = lastReadDate === yesterday ? streak + 1 : 1;
  return { streak: nextStreak, lastReadDate: today };
}

// Rolls weekly_activity / books_completed_this_week over to a fresh Mon-Sun
// week whenever the persisted week_start has gone stale, then adds
// hoursDelta to today's bucket. Kept at full float precision here — a single
// page turn only adds ~0.025h (READING_MINUTES_PER_PAGE/60), and rounding on
// every write (as the frontend's userService.js does) would discard that
// sub-0.1 remainder each time, so repeated small increments could never sum
// to a visible number. Rounding happens once, at read time, in toApiStats().
function nextWeeklyState(
  weekStart: string | null,
  weeklyActivity: number[],
  booksCompletedThisWeek: number,
  hoursDelta: number
) {
  const currentWeekStart = mondayOf(new Date());
  const stale = weekStart !== currentWeekStart;
  const activity = stale ? [0, 0, 0, 0, 0, 0, 0] : [...weeklyActivity];
  const completedThisWeek = stale ? 0 : booksCompletedThisWeek;

  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6
  activity[todayIndex] += hoursDelta;

  return { weekStart: currentWeekStart, weeklyActivity: activity, booksCompletedThisWeek: completedThisWeek };
}

export function toApiStats(row: UserStatsRow) {
  return {
    booksCompleted: row.books_completed,
    pagesRead: row.pages_read,
    streak: row.streak,
    lastReadDate: row.last_read_date,
    weekStart: row.week_start,
    // Rounded here, at read time, not on every write — see nextWeeklyState().
    weeklyActivity: (JSON.parse(row.weekly_activity) as number[]).map((h) => Math.round(h * 10) / 10),
    booksCompletedThisWeek: row.books_completed_this_week,
    // Derived, not a separately-persisted counter (Rules Engine) — matches
    // userService.js's getReadingPoints() so it can never drift out of sync
    // with pagesRead the way two independently-tracked totals could.
    readingPoints: Math.round(row.pages_read * READING_POINTS_PER_PAGE),
  };
}

// A brand-new reader starts at zero — unlike the frontend's one-time demo
// seed (SEED_WEEKLY_ACTIVITY off MOCK_USER), there's no mock history to seed
// a real account from.
export async function getOrCreateStats(db: D1Database, userId: string): Promise<UserStatsRow> {
  await db
    .prepare("INSERT OR IGNORE INTO user_stats (user_id, week_start) VALUES (?, ?)")
    .bind(userId, mondayOf(new Date()))
    .run();
  const row = await db.prepare("SELECT * FROM user_stats WHERE user_id = ?").bind(userId).first<UserStatsRow>();
  return row as UserStatsRow;
}

export async function getInProgress(db: D1Database, userId: string): Promise<Record<string, { currentPage: number; totalPages: number }>> {
  const { results } = await db
    .prepare("SELECT book_id, current_page, total_pages FROM reading_progress WHERE user_id = ? AND completed = 0")
    .bind(userId)
    .all<{ book_id: string; current_page: number; total_pages: number }>();

  const inProgress: Record<string, { currentPage: number; totalPages: number }> = {};
  for (const row of results) {
    inProgress[row.book_id] = { currentPage: row.current_page, totalPages: row.total_pages };
  }
  return inProgress;
}

// Oldest-first completion order — the frontend's ProfilePage/Dashboard
// ("Recently Read") both need this, mirroring userService.js's
// completedBookIds array, which the book.completed subscriber appends to in
// the order books actually finish.
export async function getCompletedBookIds(db: D1Database, userId: string): Promise<string[]> {
  // `id` (autoincrement) breaks ties when two books complete within the same
  // CURRENT_TIMESTAMP second, so ordering stays stable/insertion-order even
  // under rapid completions, not just "usually right."
  const { results } = await db
    .prepare("SELECT book_id FROM reading_progress WHERE user_id = ? AND completed = 1 ORDER BY completed_at ASC, id ASC")
    .bind(userId)
    .all<{ book_id: string }>();
  return results.map((row) => row.book_id);
}

export async function getProgressState(db: D1Database, userId: string) {
  const stats = await getOrCreateStats(db, userId);
  const inProgress = await getInProgress(db, userId);
  const completedBookIds = await getCompletedBookIds(db, userId);
  return { stats: toApiStats(stats), inProgress, completedBookIds };
}

// Mirrors userService.js's recordProgress() — always bumps streak/weekly
// activity (a page turn counts as reading activity even on a book already
// finished before), but only advances the per-book position if that book
// isn't already marked completed, matching the frontend's early-return.
export async function recordProgress(
  db: D1Database,
  userId: string,
  bookId: string,
  currentPage: number,
  totalPages: number
): Promise<void> {
  const stats = await getOrCreateStats(db, userId);
  const today = todayKey();
  const streakState = nextStreakState(stats.streak, stats.last_read_date, today);
  const weeklyState = nextWeeklyState(
    stats.week_start,
    JSON.parse(stats.weekly_activity),
    stats.books_completed_this_week,
    READING_MINUTES_PER_PAGE / 60
  );

  await db
    .prepare(
      `UPDATE user_stats SET streak = ?, last_read_date = ?, week_start = ?, weekly_activity = ?, books_completed_this_week = ? WHERE user_id = ?`
    )
    .bind(
      streakState.streak,
      streakState.lastReadDate,
      weeklyState.weekStart,
      JSON.stringify(weeklyState.weeklyActivity),
      weeklyState.booksCompletedThisWeek,
      userId
    )
    .run();

  const existing = await db
    .prepare("SELECT completed FROM reading_progress WHERE user_id = ? AND book_id = ?")
    .bind(userId, bookId)
    .first<{ completed: number }>();
  if (existing?.completed) return;

  await db
    .prepare(
      `INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, completed, updated_at)
       VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, book_id) DO UPDATE SET current_page = excluded.current_page, total_pages = excluded.total_pages, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, bookId, currentPage, totalPages)
    .run();
}

// Mirrors userService.js's book.completed subscriber — idempotent (a second
// call for an already-completed book is a no-op, same as the frontend's
// `if (progress.completedBookIds.includes(id)) return`), removes the book
// from in-progress, and bumps the same lifetime + this-week counters.
export async function completeBook(db: D1Database, userId: string, bookId: string, bookTotalPages: number): Promise<void> {
  const existing = await db
    .prepare("SELECT completed FROM reading_progress WHERE user_id = ? AND book_id = ?")
    .bind(userId, bookId)
    .first<{ completed: number }>();
  if (existing?.completed) return;

  const stats = await getOrCreateStats(db, userId);
  const weeklyState = nextWeeklyState(stats.week_start, JSON.parse(stats.weekly_activity), stats.books_completed_this_week, 0);

  await db
    .prepare(
      `UPDATE user_stats SET books_completed = books_completed + 1, pages_read = pages_read + ?, week_start = ?, weekly_activity = ?, books_completed_this_week = ? WHERE user_id = ?`
    )
    .bind(bookTotalPages, weeklyState.weekStart, JSON.stringify(weeklyState.weeklyActivity), weeklyState.booksCompletedThisWeek + 1, userId)
    .run();

  await db
    .prepare(
      `INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, completed, completed_at, updated_at)
       VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, book_id) DO UPDATE SET current_page = excluded.current_page, completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, bookId, bookTotalPages, bookTotalPages)
    .run();
}
