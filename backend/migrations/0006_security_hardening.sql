-- Brute-force protection for /auth/login (checked by email) and
-- /auth/register (checked by IP, since no account exists yet to key on) —
-- see src/auth/rateLimit.ts. One table for both, discriminated by `kind`,
-- rather than two similarly-shaped tables. A D1-based counter rather than a
-- Cloudflare Rate Limiting binding: no new binding/plan dependency to
-- provision, works everywhere this backend already runs.
CREATE TABLE auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK(kind IN ('login', 'register')),
  email TEXT,
  ip TEXT,
  success INTEGER NOT NULL,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_attempts_login_email ON auth_attempts(kind, email, at);
CREATE INDEX idx_auth_attempts_register_ip ON auth_attempts(kind, ip, at);

-- Generic admin-action audit trail — mirrors the submission_history pattern
-- from migrations/0003 (actor snapshotted by name/role at write-time, not a
-- live join), generalized to any entity via entity_type/entity_id instead of
-- submission_history's single-purpose submission_id.
--
-- actor_id is deliberately NOT a foreign key (unlike submission_history's
-- by_user_id): an audit write is a best-effort side note on an action that
-- already happened, and must never be able to fail — and so roll back or
-- otherwise block — the admin action it's logging.
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
