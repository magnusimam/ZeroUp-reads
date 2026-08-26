-- Real backend for the frontend's password-reset mock
-- (src/modules/auth/authService.js's requestPasswordReset/validateResetToken/
-- resetPassword) — one live token per user, same "delete existing, insert
-- fresh" pattern the mock already used.
CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
