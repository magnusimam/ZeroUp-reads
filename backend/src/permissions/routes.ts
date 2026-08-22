import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";

// Read-only reference for the RBAC breakdown (migrations/0013_permissions.sql)
// — Administrator only, since this is an admin/dev-facing view of "what can
// each role do", not reader-facing content. Enforcement itself still runs on
// requireRole(...)'s hardcoded role lists; this table doesn't drive it yet.
const permissions = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

permissions.use("*", authMiddleware, requireRole(ROLES.ADMINISTRATOR));

permissions.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT key, description FROM permissions ORDER BY key ASC").all<{
    key: string;
    description: string;
  }>();
  return c.json({ permissions: results });
});

permissions.get("/roles", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT role, permission_key FROM role_permissions ORDER BY role ASC, permission_key ASC"
  ).all<{ role: string; permission_key: string }>();

  const rolePermissions: Record<string, string[]> = {};
  for (const row of results) {
    (rolePermissions[row.role] ??= []).push(row.permission_key);
  }
  return c.json({ rolePermissions });
});

export default permissions;
