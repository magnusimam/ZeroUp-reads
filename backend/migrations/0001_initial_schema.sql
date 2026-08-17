-- Stage 2: core schema, shaped to match the existing mock data so the
-- frontend integration stages (4/6/8/10) can swap services with minimal
-- reshaping. See src/utils/mockData.js, src/services/userService.js,
-- src/modules/reading/bookmarksService.js, src/config/roles.js.
--
-- Deliberately NOT included yet (kept out to avoid building ahead of need):
--   - book_versions / publishing status: the mock app has no publishing
--     workflow state today; added in the Stage 7 migration alongside the
--     real publishing-workflow API, not speculatively here.
--   - testimonials: not part of the core read/write/auth loop being built
--     first; added when that feature's API stage is scoped.

-- Lookup table for RBAC roles (src/config/roles.js ROLES).
CREATE TABLE IF NOT EXISTS roles (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

INSERT INTO roles (code, label) VALUES
  ('reader', 'Reader'),
  ('translator', 'Translator'),
  ('author', 'Author'),
  ('editor', 'Editor'),
  ('publisher', 'Publisher'),
  ('administrator', 'Administrator');

-- Lookup table for the book-content-language taxonomy (mockData.js
-- BOOK_LANGUAGES). `code` doubles as the display name today since the mock
-- data has no ISO codes yet.
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO languages (code, name) VALUES
  ('English', 'English'),
  ('Swahili', 'Swahili'),
  ('Yoruba', 'Yoruba'),
  ('Zulu', 'Zulu'),
  ('French', 'French'),
  ('Hausa', 'Hausa'),
  ('Igbo', 'Igbo'),
  ('Pidgin', 'Pidgin'),
  ('Kanuri', 'Kanuri'),
  ('Tiv', 'Tiv'),
  ('Efik', 'Efik');

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  persona TEXT,
  org_name TEXT,
  system_role TEXT NOT NULL DEFAULT 'reader' REFERENCES roles(code),
  preferred_language TEXT REFERENCES languages(code),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  language TEXT NOT NULL REFERENCES languages(code),
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  total_pages INTEGER NOT NULL,
  category TEXT NOT NULL,
  age_group TEXT,
  rating REAL NOT NULL DEFAULT 0,
  reads INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_educational INTEGER NOT NULL DEFAULT 0,
  -- Extensible metadata bag (theme, tagline, availableLanguages, funFacts,
  -- learningObjectives, ...) mirroring the frontend's `attributes: {}`
  -- pattern (Schema-Driven Design) — JSON-encoded, not a growing set of
  -- nullable top-level columns.
  attributes TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level);

-- One row per page, replacing the mock's `content: [...]` array.
CREATE TABLE IF NOT EXISTS book_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  UNIQUE (book_id, page_number)
);

-- Per-user, per-book progress (mirrors userService.js's `inProgress` map and
-- `completedBookIds` list, normalized into rows instead of a single blob).
CREATE TABLE IF NOT EXISTS reading_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);

-- Per-user aggregate stats (mirrors userService.js's persisted progress
-- singleton: booksCompleted, pagesRead, streak, weeklyActivity, ...) — kept
-- separate from reading_progress since these are account-level aggregates,
-- not per-book rows.
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  books_completed INTEGER NOT NULL DEFAULT 0,
  pages_read INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_read_date TEXT,
  week_start TEXT,
  weekly_activity TEXT NOT NULL DEFAULT '[0,0,0,0,0,0,0]',
  books_completed_this_week INTEGER NOT NULL DEFAULT 0
);

-- Book-level "Save" (mirrors bookmarksService.js's toggleBookmark).
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, book_id)
);

-- Page-level pin, separate from the book-level bookmark above (mirrors
-- bookmarksService.js's getPageBookmark/setPageBookmark — one pin per
-- user per book).
CREATE TABLE IF NOT EXISTS page_bookmarks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id)
);
