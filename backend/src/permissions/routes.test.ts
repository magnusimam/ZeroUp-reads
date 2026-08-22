import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

async function adminAuthHeader() {
  const token = await issueToken("admin-test-user", ROLES.ADMINISTRATOR, env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

async function readerAuthHeader() {
  const token = await issueToken("reader-test-user", ROLES.READER, env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
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
