import { type BookRow, toApiBook } from "../books/service";
import { ANALYTICS_TOP_BOOKS_LIMIT } from "../config/rules";

export type AnalyticsSummary = {
  totalUsers: number;
  totalBooks: number;
  booksReadThisWeek: number;
  completionsThisWeek: number;
  topBooks: ReturnType<typeof toApiBook>[];
  byLanguage: { language: string; reads: number }[];
  byLevel: { level: string; value: number }[];
  libraryReads: number;
  libraryTitles: number;
};

// Shape matches src/utils/mockData.js's MOCK_STATS exactly, so the eventual
// frontend statsService.js swap is a one-line fetch change, not a reshape.
// Everything here is a read-only aggregate over existing tables — no new
// schema, no new write path.
export async function getAnalyticsSummary(db: D1Database): Promise<AnalyticsSummary> {
  const [usersRow, booksRow, weekRow, topBooksResult, byLanguageResult, byLevelResult] = await Promise.all([
    db.prepare("SELECT COUNT(*) as totalUsers FROM users").first<{ totalUsers: number }>(),
    db
      .prepare("SELECT COUNT(*) as totalBooks, COALESCE(SUM(reads), 0) as libraryReads FROM books")
      .first<{ totalBooks: number; libraryReads: number }>(),
    // Reuses the per-user weekly counter the Progress domain already
    // maintains (progress/service.ts's mondayOf/nextWeeklyState) instead of
    // re-deriving "this week"'s date boundary here too.
    db
      .prepare("SELECT COALESCE(SUM(books_completed_this_week), 0) as thisWeek FROM user_stats")
      .first<{ thisWeek: number }>(),
    db.prepare("SELECT * FROM books ORDER BY reads DESC LIMIT ?").bind(ANALYTICS_TOP_BOOKS_LIMIT).all<BookRow>(),
    db
      .prepare("SELECT language, SUM(reads) as reads FROM books GROUP BY language ORDER BY reads DESC")
      .all<{ language: string; reads: number }>(),
    db.prepare("SELECT level, COUNT(*) as value FROM books GROUP BY level").all<{ level: string; value: number }>(),
  ]);

  const totalUsers = usersRow?.totalUsers ?? 0;
  const totalBooks = booksRow?.totalBooks ?? 0;
  const libraryReads = booksRow?.libraryReads ?? 0;
  const thisWeek = weekRow?.thisWeek ?? 0;

  return {
    totalUsers,
    totalBooks,
    booksReadThisWeek: thisWeek,
    completionsThisWeek: thisWeek,
    topBooks: topBooksResult.results.map(toApiBook),
    byLanguage: byLanguageResult.results,
    byLevel: byLevelResult.results,
    libraryReads,
    libraryTitles: totalBooks,
  };
}
