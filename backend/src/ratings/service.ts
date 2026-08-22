export type RatingSummary = { average: number; count: number };

// Rounded to one decimal for display — same precision `books.rating` (the
// old static seed number) already used.
export async function getRatingSummary(db: D1Database, bookId: string): Promise<RatingSummary> {
  const row = await db
    .prepare("SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE book_id = ?")
    .bind(bookId)
    .first<{ average: number | null; count: number }>();
  return {
    average: row?.average ? Math.round(row.average * 10) / 10 : 0,
    count: row?.count ?? 0,
  };
}

export async function getMyRating(db: D1Database, bookId: string, userId: string): Promise<number | null> {
  const row = await db
    .prepare("SELECT rating FROM ratings WHERE book_id = ? AND user_id = ?")
    .bind(bookId, userId)
    .first<{ rating: number }>();
  return row ? row.rating : null;
}

// Upsert — one rating per user per book (migrations/0011's UNIQUE constraint).
export async function setRating(db: D1Database, bookId: string, userId: string, rating: number): Promise<void> {
  await db
    .prepare(
      `INSERT INTO ratings (user_id, book_id, rating) VALUES (?, ?, ?)
       ON CONFLICT (user_id, book_id) DO UPDATE SET rating = excluded.rating, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, bookId, rating)
    .run();
}

export async function deleteRating(db: D1Database, bookId: string, userId: string): Promise<void> {
  await db.prepare("DELETE FROM ratings WHERE book_id = ? AND user_id = ?").bind(bookId, userId).run();
}
