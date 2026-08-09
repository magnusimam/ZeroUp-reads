// Centralized RBAC taxonomy (Rules Engine principle) — the six system roles
// a user can hold, kept separate from the free-text "who are you" persona
// collected at signup (Teacher/Parent/Student/etc. in RegisterPage.jsx, used
// only for onboarding personalization copy, never for permission checks).
export const ROLES = {
  READER: 'reader',
  TRANSLATOR: 'translator',
  AUTHOR: 'author',
  EDITOR: 'editor',
  PUBLISHER: 'publisher',
  ADMINISTRATOR: 'administrator',
};

export const ROLE_LABELS = {
  [ROLES.READER]: 'Reader',
  [ROLES.TRANSLATOR]: 'Translator',
  [ROLES.AUTHOR]: 'Author',
  [ROLES.EDITOR]: 'Editor',
  [ROLES.PUBLISHER]: 'Publisher',
  [ROLES.ADMINISTRATOR]: 'Administrator',
};

export const ALL_ROLES = Object.values(ROLES);

// Publishing Pipeline access — every role that can touch a draft/submission in
// some capacity. "Reviewer" from the publishing workflow brief is performed by
// the Editor or Administrator role rather than being a 7th distinct system
// role, since the role-management brief's own role list caps at these six.
export const PUBLISHING_ROLES = [ROLES.AUTHOR, ROLES.TRANSLATOR, ROLES.EDITOR, ROLES.PUBLISHER, ROLES.ADMINISTRATOR];

// Translation Portal access.
export const TRANSLATION_ROLES = [ROLES.TRANSLATOR, ROLES.EDITOR, ROLES.ADMINISTRATOR];

// Resolves a user's real permission level, tolerating accounts created before
// `systemRole` existed: the pre-existing dev test helpers / any legacy session
// set a bare `role: 'admin'` string (see AuthContext.js's loginAsAdmin) — that
// still resolves to full administrator access instead of silently locking
// existing admins out, the same "missing field degrades gracefully" pattern
// userService.js already uses for streak fields.
export function effectiveRole(user) {
  if (!user) return null;
  if (user.systemRole) return user.systemRole;
  if (user.role === 'admin') return ROLES.ADMINISTRATOR;
  return ROLES.READER;
}

export function hasRole(user, allow) {
  const role = effectiveRole(user);
  return Boolean(role) && allow.includes(role);
}
