-- Permissions (blueprint §6) — the granular breakdown paired with `roles`.
-- Enforcement today still runs on the role enum directly (src/auth/middleware.ts's
-- requireRole(...), called from books/users/publishing/analytics/audit
-- routes) — this table is a faithful, seeded mirror of exactly those
-- existing requireRole(...) call sites, not a new set of capabilities, and
-- nothing reads from it yet. Wiring requireRole() itself to check this table
-- instead of a hardcoded role list is a separate follow-up.
CREATE TABLE IF NOT EXISTS permissions (
  key TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

INSERT INTO permissions (key, description) VALUES
  ('books.write', 'Create or edit a book (POST/PATCH /books)'),
  ('books.delete', 'Delete a book (DELETE /books/:id)'),
  ('users.manage', 'List users and change roles (GET /users, PATCH /users/:id/role)'),
  ('analytics.view', 'View platform analytics (GET /analytics)'),
  ('audit_log.view', 'View the audit log (GET /audit-log)'),
  ('submissions.access', 'Access the Publishing workflow at all (list/view/create/comment)'),
  ('submissions.submit', 'Submit a draft/needs_changes submission for review'),
  ('submissions.review', 'Start review, request changes, or approve a submission'),
  ('submissions.publish', 'Publish an approved submission');

INSERT INTO role_permissions (role, permission_key) VALUES
  ('administrator', 'books.write'),
  ('administrator', 'books.delete'),
  ('administrator', 'users.manage'),
  ('administrator', 'analytics.view'),
  ('administrator', 'audit_log.view'),
  ('administrator', 'submissions.access'),
  ('administrator', 'submissions.submit'),
  ('administrator', 'submissions.review'),
  ('administrator', 'submissions.publish'),
  ('author', 'submissions.access'),
  ('author', 'submissions.submit'),
  ('translator', 'submissions.access'),
  ('translator', 'submissions.submit'),
  ('editor', 'submissions.access'),
  ('editor', 'submissions.review'),
  ('publisher', 'submissions.access'),
  ('publisher', 'submissions.publish');
