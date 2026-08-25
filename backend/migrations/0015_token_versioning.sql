-- Closes the real gap noted in backend/README.md's Stage status: a role
-- change didn't invalidate an already-issued token until its natural 7-day
-- expiry. `token_version` is embedded in every JWT as the `tv` claim
-- (auth/jwt.ts) and checked against the user's current row on every
-- authenticated request (auth/middleware.ts) — bumping it (done by
-- PATCH /users/:id/role) instantly revokes every token issued before the
-- bump, without needing a token blocklist.
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
