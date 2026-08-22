-- Ratings & Reviews (blueprint §6) — kept as two separate tables per the
-- blueprint's own listing, not folded into one: a reader can rate a book
-- (a single 1-5 number) without writing anything, and the two are queried
-- independently (an average rating vs. a review feed). `books.rating` stays
-- exactly as-is — a seeded/static number — until a follow-up stage
-- re-aggregates it from this table; that recompute isn't done here.
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_book ON ratings(book_id);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
