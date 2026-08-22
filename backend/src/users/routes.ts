import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES, ALL_ROLES } from "../config/roles";
import { toSafeUser, getActorName, type UserRow } from "./service";
import { writeAuditLog } from "../audit/service";
import { logEvent } from "../utils/logger";

const roleSchema = z.object({
  systemRole: z.enum(ALL_ROLES as [string, ...string[]]),
});

const users = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

users.use("*", authMiddleware, requireRole(ROLES.ADMINISTRATOR));

// Mirrors the pre-existing frontend UserManagementPage's "All Users" table —
// Administrator-only, matching /admin/users' RequireRole gate.
users.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM users ORDER BY created_at ASC").all<UserRow>();
  return c.json({ users: results.map(toSafeUser) });
});

// Promotes/demotes a user's system_role — the endpoint that didn't exist
// before (see ENGINEERING_PRINCIPLES_TRACKER.md): the frontend's role
// dropdown previously had nowhere real to write to. Any Administrator can
// promote/demote any other user, same self-service model the pre-existing
// frontend page already assumed — EXCEPT the single Owner account
// (is_owner, Stage 11), whose role this endpoint refuses to touch for any
// caller, including the Owner themselves (prevents both tampering by other
// admins and an accidental self-lockout). There's no API path that sets
// is_owner — see migrations/0004_owner_flag.sql.
users.patch("/:id/role", zValidator("json", roleSchema), async (c) => {
  const id = c.req.param("id");
  const { systemRole } = c.req.valid("json");
  const authUser = c.get("authUser");

  const existing = await c.env.DB.prepare("SELECT id, system_role, is_owner FROM users WHERE id = ?")
    .bind(id)
    .first<{ id: string; system_role: string; is_owner: number }>();
  if (!existing) {
    return c.json({ error: "User not found." }, 404);
  }
  if (existing.is_owner) {
    const actorName = await getActorName(c.env.DB, authUser.sub);
    await writeAuditLog(c.env.DB, {
      actorId: authUser.sub,
      actorName,
      actorRole: authUser.role,
      action: "role_change_denied_owner",
      entityType: "user",
      entityId: id,
      metadata: { attemptedRole: systemRole },
    });
    logEvent("warn", "Attempted to change the Owner account's role", { actorId: authUser.sub, targetId: id });
    return c.json({ error: "The Owner account's role cannot be changed." }, 403);
  }

  await c.env.DB.prepare("UPDATE users SET system_role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(systemRole, id)
    .run();

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await writeAuditLog(c.env.DB, {
    actorId: authUser.sub,
    actorName,
    actorRole: authUser.role,
    action: "role_changed",
    entityType: "user",
    entityId: id,
    metadata: { from: existing.system_role, to: systemRole },
  });

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return c.json({ user: toSafeUser(row as UserRow) });
});

export default users;
