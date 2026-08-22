export type ReviewRow = {
  id: string;
  user_id: string;
  book_id: string;
  review_text: string;
  created_at: string;
  updated_at: string;
  reviewer_name: string;
};

export function toApiReview(row: ReviewRow) {
  return {
    id: row.id,
    userId: row.user_id,
    reviewerName: row.reviewer_name,
    bookId: row.book_id,
    reviewText: row.review_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Joins users for a display name — a review is meaningless without knowing
// who wrote it, same reasoning as submission_history's by_name snapshot.
export async function listReviews(db: D1Database, bookId: string): Promise<ReviewRow[]> {
  const { results } = await db
    .prepare(
      `SELECT reviews.*, users.name as reviewer_name FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.book_id = ? ORDER BY reviews.created_at DESC`
    )
    .bind(bookId)
    .all<ReviewRow>();
  return results;
}

// Upsert — one review per user per book (migrations/0011's UNIQUE constraint).
// The id column is left out of the ON CONFLICT's SET clause, so an edit
// keeps its original id rather than adopting the freshly-generated one.
export async function setReview(db: D1Database, bookId: string, userId: string, reviewText: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO reviews (id, user_id, book_id, review_text) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, book_id) DO UPDATE SET review_text = excluded.review_text, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(crypto.randomUUID(), userId, bookId, reviewText)
    .run();
}

export async function deleteReview(db: D1Database, bookId: string, userId: string): Promise<void> {
  await db.prepare("DELETE FROM reviews WHERE book_id = ? AND user_id = ?").bind(bookId, userId).run();
}
