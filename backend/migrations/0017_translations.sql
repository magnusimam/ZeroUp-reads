-- Stage 18: Translation workflow (blueprint §10) — the real backend for the
-- frontend's localStorage-only src/modules/books/translationRequestService.js
-- (reader requests) and src/modules/translation/translationService.js
-- (translator drafts → human review → approval → a published translated book).

-- A reader's "please translate this book into X" request. An administrator
-- accepts it (it then shows up for translators) or rejects it; it becomes
-- `fulfilled` once a translator's draft for the same book+language is
-- approved. Accepting never publishes anything by itself.
CREATE TABLE IF NOT EXISTS translation_requests (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  language TEXT NOT NULL REFERENCES languages(code),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'fulfilled')),
  requested_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  translated_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translation_requests_status ON translation_requests(status);
CREATE INDEX IF NOT EXISTS idx_translation_requests_book_language ON translation_requests(book_id, language);

-- One translator's side-by-side translation of one book into one language.
-- Mirrors translationService.js's draft shape and its
-- in_progress → submitted → (rejected → submitted …) → approved lifecycle.
CREATE TABLE IF NOT EXISTS translation_drafts (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL REFERENCES languages(code),
  translator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'rejected', 'approved')),
  -- Set only by the approve action — the one step that creates a real,
  -- live translated book (same posture as submissions.published_book_id).
  translated_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  last_saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translation_drafts_translator ON translation_drafts(translator_id);
CREATE INDEX IF NOT EXISTS idx_translation_drafts_status ON translation_drafts(status);
CREATE INDEX IF NOT EXISTS idx_translation_drafts_book_language ON translation_drafts(book_id, target_language);

-- The original text is snapshotted per paragraph when the draft starts, so a
-- later edit to the source book can't silently shift what a translator was
-- translating against.
CREATE TABLE IF NOT EXISTS translation_draft_paragraphs (
  draft_id TEXT NOT NULL REFERENCES translation_drafts(id) ON DELETE CASCADE,
  paragraph_index INTEGER NOT NULL,
  original TEXT NOT NULL,
  translated TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (draft_id, paragraph_index)
);

-- Review timeline — by_name snapshotted at write time, same reasoning as
-- submission_history.
CREATE TABLE IF NOT EXISTS translation_draft_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id TEXT NOT NULL REFERENCES translation_drafts(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  by_user_id TEXT NOT NULL REFERENCES users(id),
  by_name TEXT NOT NULL,
  comment TEXT,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translation_draft_history_draft ON translation_draft_history(draft_id);

-- Enforced by auth/middleware.ts's requirePermission(), like every key in
-- migrations/0013. Matches the frontend's TRANSLATION_ROLES
-- (src/config/roles.js) for workspace access and its Editor/Administrator
-- reviewer check in TranslationWorkspacePage.
INSERT INTO permissions (key, description) VALUES
  ('translations.access', 'Use the Translation Workspace (see open requests, start/edit/submit own drafts)'),
  ('translations.review', 'Approve or send back a submitted translation draft'),
  ('translation_requests.manage', 'Accept or reject reader translation requests');

INSERT INTO role_permissions (role, permission_key) VALUES
  ('administrator', 'translations.access'),
  ('administrator', 'translations.review'),
  ('administrator', 'translation_requests.manage'),
  ('translator', 'translations.access'),
  ('editor', 'translations.access'),
  ('editor', 'translations.review');
