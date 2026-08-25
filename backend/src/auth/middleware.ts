import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../env";
import { verifyToken, type AuthTokenPayload } from "./jwt";
import type { Role } from "../config/roles";

export type AuthVariables = {
  authUser: AuthTokenPayload;
};

// Rejects a token whose `tv` claim no longer matches the user's current
// token_version — the revocation check (migrations/0015_token_versioning.sql):
// PATCH /users/:id/role bumps the row's token_version on every role change,
// so this is what actually makes an old token stop working immediately
// instead of merely carrying a stale role claim until it naturally expires.
// A missing user row (deleted mid-session) fails the same way as a version
// mismatch — both mean "this token no longer authorizes anyone."
async function isTokenRevoked(db: D1Database, payload: AuthTokenPayload): Promise<boolean> {
  const row = await db.prepare("SELECT token_version FROM users WHERE id = ?").bind(payload.sub).first<{ token_version: number }>();
  return !row || row.token_version !== payload.tv;
}

// Verifies the `Authorization: Bearer <token>` header and attaches the
// decoded payload to context as `authUser`. Route handlers/requireRole read
// from context rather than re-verifying, so the token is only ever checked
// once per request.
export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header." }, 401);
  }

  const token = header.slice("Bearer ".length);
  let payload: AuthTokenPayload;
  try {
    payload = await verifyToken(token, c.env.JWT_SECRET);
  } catch {
    return c.json({ error: "Invalid or expired token." }, 401);
  }

  if (await isTokenRevoked(c.env.DB, payload)) {
    return c.json({ error: "Invalid or expired token." }, 401);
  }

  c.set("authUser", payload);
  await next();
};

// Like authMiddleware, but never blocks — for routes that behave differently
// for a signed-in caller (e.g. Collections: a private one only shows up for
// its owner) without requiring one (a public collection still works for a
// guest). Returns null for a missing/invalid token instead of 401ing.
export async function getOptionalUser<E extends { Bindings: Env }>(c: Context<E>): Promise<AuthTokenPayload | null> {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const payload = await verifyToken(header.slice("Bearer ".length), c.env.JWT_SECRET);
    if (await isTokenRevoked(c.env.DB, payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Composes after authMiddleware — restricts a route to a set of roles.
// Still used directly (rather than requirePermission below) for the handful
// of Administrator-only routes migrations/0013_permissions.sql's seed never
// covered (Authors/Illustrators PATCH, BookVersions GET, the Permissions
// routes themselves) — there's no permission_key for those yet, so there's
// nothing in role_permissions for requirePermission to check.
export function requireRole(
  ...roles: Role[]
): MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> {
  return async (c, next) => {
    const user = c.get("authUser");
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden." }, 403);
    }
    await next();
  };
}

// The Permissions domain's payoff (migrations/0013_permissions.sql,
// ENGINEERING_PRINCIPLES_TRACKER.md's roadmap item): every call site below
// that maps onto one of that table's seeded permission_keys now enforces
// off role_permissions directly instead of a hardcoded role list — the
// GET /permissions/roles response an admin sees IS what's enforced, not a
// separate description of it. Granting a role a new permission is now a
// data change (an INSERT into role_permissions), not a code change.
export function requirePermission(
  permissionKey: string
): MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> {
  return async (c, next) => {
    const user = c.get("authUser");
    if (!user) {
      return c.json({ error: "Forbidden." }, 403);
    }
    const grant = await c.env.DB.prepare("SELECT 1 FROM role_permissions WHERE role = ? AND permission_key = ?")
      .bind(user.role, permissionKey)
      .first();
    if (!grant) {
      return c.json({ error: "Forbidden." }, 403);
    }
    await next();
  };
}
