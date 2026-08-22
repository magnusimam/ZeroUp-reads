-- Authors & Illustrators (blueprint §6) as real entities, additive alongside
-- the existing `books.author` TEXT column rather than replacing it — every
-- route/service that reads/writes `books.author` keeps working unchanged.
-- `author_id`/`illustrator_id` link a book to a full profile (bio, photo)
-- once one exists, without forcing every book to have one.
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  bio TEXT,
  photo_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS illustrators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  bio TEXT,
  photo_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE books ADD COLUMN author_id TEXT REFERENCES authors(id);
ALTER TABLE books ADD COLUMN illustrator_id TEXT REFERENCES illustrators(id);

-- Backfill: one authors row per distinct existing books.author name, linked
-- back onto every book with that name. No migration runs inside the app
-- (no crypto.randomUUID() available here), so ids use SQLite's own
-- pseudo-random-hex idiom — 32 hex chars, opaque like the app's UUIDs, just
-- not RFC4122-dashed.
INSERT INTO authors (id, name)
SELECT lower(hex(randomblob(16))), author FROM books GROUP BY author;

UPDATE books SET author_id = (SELECT id FROM authors WHERE authors.name = books.author);

-- No illustrator backfill — no book has ever recorded an illustrator name,
-- so every book's illustrator_id starts NULL rather than fabricating rows.

CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_illustrator_id ON books(illustrator_id);
