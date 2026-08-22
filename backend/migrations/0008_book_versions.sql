-- BookVersions (blueprint §6) — a full snapshot of a book's editable fields
-- immediately before each PATCH /books/:id, so an edit is recoverable rather
-- than a silent overwrite. version_number is per-book, starting at 1.
--
-- Schema only for now, same "table exists before its API" posture as the
-- `languages` table (seeded Stage 2, not exposed until GET /languages in
-- Stage 13) — PATCH /books/:id doesn't write a row here yet. That's a
-- follow-up wiring step, not done in this migration.
CREATE TABLE IF NOT EXISTS book_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  age_group TEXT,
  description TEXT,
  is_educational INTEGER NOT NULL,
  attributes TEXT NOT NULL,
  -- JSON array of page strings, matching book_pages' content shape flattened
  -- into one snapshot column (a version is read as a whole, never paginated).
  content TEXT NOT NULL,
  -- Deliberately NOT a foreign key, same reasoning as audit_log.actor_id
  -- (migrations/0006): a version snapshot is a best-effort side note on an
  -- edit that's already happening, and must never be able to fail — and so
  -- block the PATCH it's recording — just because the acting admin's id
  -- doesn't happen to satisfy a FK (e.g. a test fixture's synthetic token).
  edited_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (book_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_book_versions_book ON book_versions(book_id, version_number DESC);
