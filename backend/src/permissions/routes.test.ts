import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES, type Role } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

// A real registered user, not a fabricated id — migrations/0015_token_versioning.sql
// means authMiddleware now 401s a token whose user id doesn't exist in `users`.
let userCounter = 0;
async function authHeader(role: Role) {
  userCounter += 1;
  const email = `permissions-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }) },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

async function adminAuthHeader() {
  return authHeader(ROLES.ADMINISTRATOR);
}

async function readerAuthHeader() {
  return authHeader(ROLES.READER);
}

describe("GET /permissions", () => {
  it("requires auth", async () => {
    const res = await app.request("/permissions", {}, env);
    expect(res.status).toBe(401);
  });

  it("rejects a reader token with 403", async () => {
    const res = await app.request("/permissions", { headers: await readerAuthHeader() }, env);
    expect(res.status).toBe(403);
  });

  it("lists the seeded permission definitions for an administrator", async () => {
    const res = await app.request("/permissions", { headers: await adminAuthHeader() }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.permissions.some((p: { key: string }) => p.key === "books.write")).toBe(true);
  });
});

describe("GET /permissions/roles", () => {
  it("mirrors the real requireRole(...) call sites for each role", async () => {
    const res = await app.request("/permissions/roles", { headers: await adminAuthHeader() }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.rolePermissions.administrator).toEqual(
      expect.arrayContaining(["books.write", "books.delete", "users.manage", "analytics.view", "audit_log.view"])
    );
    expect(body.rolePermissions.publisher).toEqual(["submissions.access", "submissions.publish"]);
    expect(body.rolePermissions.reader).toBeUndefined();
  });
});
