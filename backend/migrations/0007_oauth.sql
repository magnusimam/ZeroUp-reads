-- Google OAuth scaffold (src/auth/oauthGoogle.ts) — non-functional until a
-- real Google Cloud OAuth client is registered and its secret set via
-- `wrangler secret put`, same deferred-until-owner posture as JWT_SECRET.
--
-- password_hash stays NOT NULL: an OAuth-created account gets a random,
-- never-disclosed value through the existing hashPassword(), avoiding a
-- risky SQLite column-nullability migration for no real benefit — nobody
-- can log in with that password, only via the OAuth flow.
ALTER TABLE users ADD COLUMN oauth_provider TEXT;
ALTER TABLE users ADD COLUMN oauth_subject TEXT;

-- One-time-use CSRF token for the authorization-code round trip — created in
-- /auth/oauth/google/start, deleted (not just marked used) on redemption in
-- /auth/oauth/google/callback, so a replayed state 400s instead of silently
-- succeeding twice.
CREATE TABLE oauth_states (
  state TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
