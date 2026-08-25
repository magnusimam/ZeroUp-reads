// RBAC role taxonomy. Must be kept in sync with the frontend's
// src/config/roles.js and the seeded `roles` table in
// migrations/0001_initial_schema.sql — same "each layer keeps its own
// authoritative copy of a small fixed enum" pattern already used for the
// book category/language/level taxonomies (see ENGINEERING_PRINCIPLES_TRACKER.md
// Principle 4's taxonomy-drift history).
export const ROLES = {
  READER: "reader",
  TRANSLATOR: "translator",
  AUTHOR: "author",
  EDITOR: "editor",
  PUBLISHER: "publisher",
  ADMINISTRATOR: "administrator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES) as Role[];

// Publishing Pipeline access used to be enumerated here as PUBLISHING_ROLES/
// REVIEWER_ROLES/PUBLISHER_ROLES ("Reviewer" from the publishing workflow
// brief is performed by Editor/Administrator rather than a 7th distinct
// role) — publishing/routes.ts's requireRole(...) call sites read those
// directly. As of migrations/0013_permissions.sql + auth/middleware.ts's
// requirePermission(), which role can submit/review/publish is data in
// role_permissions (see GET /permissions/roles) instead, so those groupings
// no longer need a code-level definition here.
