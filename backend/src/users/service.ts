export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  persona: string | null;
  org_name: string | null;
  system_role: string;
  preferred_language: string | null;
  is_owner: number;
  created_at: string;
  updated_at: string;
};

// Maps the DB row (snake_case, includes password_hash) to the shape the API
// returns (camelCase, password stripped) — shared by auth/routes.ts (its own
// session/register/login responses) and users/routes.ts (the admin list),
// so the two can never drift into returning a user in two different shapes.
export function toSafeUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    persona: row.persona,
    orgName: row.org_name,
    systemRole: row.system_role,
    preferredLanguage: row.preferred_language,
    isOwner: Boolean(row.is_owner),
    createdAt: row.created_at,
  };
}
