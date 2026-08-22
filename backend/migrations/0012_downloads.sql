-- Downloads (blueprint §6) — records that a reader downloaded a book for
-- offline reading. One row per download event (not a unique-per-user-book
-- constraint), since a reader may re-download after clearing local storage
-- and knowing that history has its own value later (e.g. "most downloaded").
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  downloaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_book ON downloads(book_id);
