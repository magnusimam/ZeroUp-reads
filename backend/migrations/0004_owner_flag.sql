-- Stage 11: a single, protected Owner account — distinct from the regular
-- Administrator role, which can already manage everyone else's system_role.
-- is_owner is never set through any API/UI; it's a one-time manual DB edit
-- (`UPDATE users SET is_owner = 1 WHERE id = ?`), same deliberate
-- deferred-until-owner bootstrap pattern already used for the very first
-- Administrator (see backend/README.md's User & Role Management section).
-- PATCH /users/:id/role refuses to change the role of whichever account
-- carries this flag, for any caller — including that account itself.
ALTER TABLE users ADD COLUMN is_owner INTEGER NOT NULL DEFAULT 0;
