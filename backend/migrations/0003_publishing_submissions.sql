-- Stage 8: Publishing workflow — mirrors src/modules/publishing's
-- draft -> submitted -> review -> needs_changes -> approved -> published
-- lifecycle (publishingConfig.js's STATUS) and publishingService.js's
-- submission/history/comment shapes.

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL REFERENCES languages(code),
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'review', 'needs_changes', 'approved', 'published')),
  -- Set only once the publish action runs — the one step that creates a
  -- real, live library book (mirrors publishingService.js's publish()).
  published_book_id TEXT REFERENCES books(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_author ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

CREATE TABLE IF NOT EXISTS submission_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  UNIQUE (submission_id, page_number)
);

-- Approval-history timeline (StatusTimeline.jsx). by_name is a snapshot at
-- the time of the action, not a live join to users — matches
-- publishingService.js's pushHistory(), and means history reads correctly
-- even if the actor's display name changes later.
CREATE TABLE IF NOT EXISTS submission_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  by_user_id TEXT NOT NULL REFERENCES users(id),
  by_name TEXT NOT NULL,
  comment TEXT,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submission_history_submission ON submission_history(submission_id);

CREATE TABLE IF NOT EXISTS submission_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  by_user_id TEXT NOT NULL REFERENCES users(id),
  by_name TEXT NOT NULL,
  by_role TEXT NOT NULL,
  text TEXT NOT NULL,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submission_comments_submission ON submission_comments(submission_id);
