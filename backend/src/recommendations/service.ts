import { type BookRow, toApiBook } from "../books/service";
import { RECOMMENDATIONS_LIMIT } from "../config/rules";

function placeholders(n: number): string {
  return Array(n).fill("?").join(", ");
}

async function getExcludedBookIds(db: D1Database, userId: string): Promise<string[]> {
  // Anything already completed or in progress — no point recommending a book
  // the reader is already partway through or has finished.
  const { results } = await db
    .prepare("SELECT book_id FROM reading_progress WHERE user_id = ?")
    .bind(userId)
    .all<{ book_id: string }>();
  return results.map((r) => r.book_id);
}

async function getInterestTags(db: D1Database, userId: string): Promise<{ categories: string[]; languages: string[] }> {
  const { results } = await db
    .prepare(
      `SELECT DISTINCT b.category, b.language FROM books b
       WHERE b.id IN (
         SELECT book_id FROM reading_progress WHERE user_id = ? AND completed = 1
         UNION
         SELECT book_id FROM bookmarks WHERE user_id = ?
       )`
    )
    .bind(userId, userId)
    .all<{ category: string; language: string }>();
  return {
    categories: [...new Set(results.map((r) => r.category))],
    languages: [...new Set(results.map((r) => r.language))],
  };
}

async function booksMatching(
  db: D1Database,
  column: "category" | "language",
  values: string[],
  excludeIds: string[],
  limit: number
): Promise<BookRow[]> {
  if (limit <= 0 || values.length === 0) return [];
  const excludeClause = excludeIds.length > 0 ? `AND id NOT IN (${placeholders(excludeIds.length)})` : "";
  const { results } = await db
    .prepare(`SELECT * FROM books WHERE ${column} IN (${placeholders(values.length)}) ${excludeClause} ORDER BY rating DESC LIMIT ?`)
    .bind(...values, ...excludeIds, limit)
    .all<BookRow>();
  return results;
}

async function topRated(db: D1Database, excludeIds: string[], limit: number): Promise<BookRow[]> {
  if (limit <= 0) return [];
  const excludeClause = excludeIds.length > 0 ? `WHERE id NOT IN (${placeholders(excludeIds.length)})` : "";
  const { results } = await db
    .prepare(`SELECT * FROM books ${excludeClause} ORDER BY rating DESC LIMIT ?`)
    .bind(...excludeIds, limit)
    .all<BookRow>();
  return results;
}

// Rule-based, not ML — reads a signed-in reader's completed/bookmarked books
// for category+language overlap, tops up with globally top-rated books when
// there isn't enough history yet (new reader) or the overlap set is thin.
// Mirrors the same fallback-to-top-rated behavior the frontend onboarding
// wizard's RecommendationsStep.jsx already uses.
//
// Tiered, not one blended query: category match, then language match, then
// top-rated fill — each tier excludes what earlier tiers already picked.
// A single OR'd query ranked purely by rating would let language alone (a
// much broader, less specific signal — e.g. "English" matches most of the
// catalogue) drown out the more specific category signal entirely whenever
// enough other-category books in that language happen to be rated higher.
export async function getRecommendations(db: D1Database, userId: string) {
  const excludedIds = await getExcludedBookIds(db, userId);
  const { categories, languages } = await getInterestTags(db, userId);

  let picks: BookRow[] = await booksMatching(db, "category", categories, excludedIds, RECOMMENDATIONS_LIMIT);

  if (picks.length < RECOMMENDATIONS_LIMIT) {
    const exclude = [...excludedIds, ...picks.map((b) => b.id)];
    const byLanguage = await booksMatching(db, "language", languages, exclude, RECOMMENDATIONS_LIMIT - picks.length);
    picks = [...picks, ...byLanguage];
  }

  if (picks.length < RECOMMENDATIONS_LIMIT) {
    const exclude = [...excludedIds, ...picks.map((b) => b.id)];
    const fill = await topRated(db, exclude, RECOMMENDATIONS_LIMIT - picks.length);
    picks = [...picks, ...fill];
  }

  return picks.map(toApiBook);
}
