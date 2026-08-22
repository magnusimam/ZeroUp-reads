import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../env";
import { verifyToken, type AuthTokenPayload } from "./jwt";
import type { Role } from "../config/roles";

export type AuthVariables = {
  authUser: AuthTokenPayload;
};

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
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    c.set("authUser", payload);
  } catch {
    return c.json({ error: "Invalid or expired token." }, 401);
  }

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
    return await verifyToken(header.slice("Bearer ".length), c.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Composes after authMiddleware — restricts a route to a set of roles.
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
