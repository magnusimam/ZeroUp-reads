import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";

// Read-only reference for the RBAC breakdown (migrations/0013_permissions.sql)
// — Administrator only, since this is an admin/dev-facing view of "what can
// each role do", not reader-facing content. Gated by requireRole rather than
// requirePermission itself: viewing this table isn't one of the
// capabilities seeded into the table it's viewing. Most other
// Administrator-only routes (books/users/analytics/audit/publishing) now DO
// enforce off this same table via requirePermission() (auth/middleware.ts).
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
