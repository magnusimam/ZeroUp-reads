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
