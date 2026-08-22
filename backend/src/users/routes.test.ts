import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES, type Role } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

let userCounter = 0;

async function registerAndToken(role: Role) {
  userCounter += 1;
  const email = `users-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  // The JWT claim, not user.systemRole, is what authMiddleware/requireRole
  // actually trust — same "doesn't need to match the DB row" note as
  // publishing/routes.test.ts's registerAndToken().
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { userId: user.id as string, email, header: { Authorization: `Bearer ${token}` } };
}

describe("GET /users", () => {
  it("requires auth", async () => {
    const res = await app.request("/users", {}, env);
    expect(res.status).toBe(401);
  });

  it("rejects a non-administrator", async () => {
    const { header } = await registerAndToken(ROLES.READER);
    const res = await app.request("/users", { headers: header }, env);
    expect(res.status).toBe(403);
  });

  it("lists every registered user, password stripped", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const res = await app.request("/users", { headers: admin.header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.users.some((u: { email: string }) => u.email === admin.email)).toBe(true);
    expect(body.users[0].password_hash).toBeUndefined();
    expect(body.users[0].passwordHash).toBeUndefined();
  });
});

describe("PATCH /users/:id/role", () => {
  it("rejects a non-administrator", async () => {
    const reader = await registerAndToken(ROLES.READER);
    const res = await app.request(
      `/users/${reader.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...reader.header }, body: JSON.stringify({ systemRole: "administrator" }) },
      env
    );
    expect(res.status).toBe(403);
  });

  it("404s for an unknown user", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const res = await app.request(
      "/users/does-not-exist/role",
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "editor" }) },
      env
    );
    expect(res.status).toBe(404);
  });

  it("400s on an invalid role", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const target = await registerAndToken(ROLES.READER);
    const res = await app.request(
      `/users/${target.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "superuser" }) },
      env
    );
    expect(res.status).toBe(400);
  });

  it("promotes a reader to administrator", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const target = await registerAndToken(ROLES.READER);

    const res = await app.request(
      `/users/${target.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "administrator" }) },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.user.systemRole).toBe("administrator");

    // Persisted, not just echoed back in the response.
    const listRes = await app.request("/users", { headers: admin.header }, env);
    const listBody = await json(listRes);
    const persisted = listBody.users.find((u: { id: string }) => u.id === target.userId);
    expect(persisted.systemRole).toBe("administrator");
  });

  it("a promoted user's OLD token still carries the old role until they log in again", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const target = await registerAndToken(ROLES.READER);
    await app.request(
      `/users/${target.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "administrator" }) },
      env
    );

    // target.header's JWT was issued before the promotion and still claims reader.
    const res = await app.request("/users", { headers: target.header }, env);
    expect(res.status).toBe(403);
  });

  describe("Owner protection", () => {
    // is_owner has no API to set it (see migrations/0004_owner_flag.sql) —
    // tests simulate the one-time manual DB bootstrap directly.
    async function makeOwner(userId: string) {
      await env.DB.prepare("UPDATE users SET is_owner = 1 WHERE id = ?").bind(userId).run();
    }

    // Promotes a fresh registrant's REAL DB row to administrator (not just
    // their JWT claim — register() always persists 'reader', see
    // registerAndToken()'s comment above), then flags them as Owner. This
    // way "the Owner's role can't be changed" tests against a real, already-
    // persisted administrator row, not an assumed one.
    async function makeAdministratorOwner(bootstrapAdminHeader: Record<string, string>) {
      const candidate = await registerAndToken(ROLES.READER);
      await app.request(
        `/users/${candidate.userId}/role`,
        { method: "PATCH", headers: { "Content-Type": "application/json", ...bootstrapAdminHeader }, body: JSON.stringify({ systemRole: "administrator" }) },
        env
      );
      await makeOwner(candidate.userId);
      return candidate;
    }

    it("refuses to change the Owner's role, even for another Administrator", async () => {
      const bootstrapAdmin = await registerAndToken(ROLES.ADMINISTRATOR);
      const owner = await makeAdministratorOwner(bootstrapAdmin.header);

      const res = await app.request(
        `/users/${owner.userId}/role`,
        { method: "PATCH", headers: { "Content-Type": "application/json", ...bootstrapAdmin.header }, body: JSON.stringify({ systemRole: "reader" }) },
        env
      );
      expect(res.status).toBe(403);

      const listRes = await app.request("/users", { headers: bootstrapAdmin.header }, env);
      const listBody = await json(listRes);
      const persisted = listBody.users.find((u: { id: string }) => u.id === owner.userId);
      expect(persisted.systemRole).toBe("administrator");
      expect(persisted.isOwner).toBe(true);
    });

    it("refuses to let the Owner change their OWN role too (no accidental self-lockout)", async () => {
      const bootstrapAdmin = await registerAndToken(ROLES.ADMINISTRATOR);
      const owner = await makeAdministratorOwner(bootstrapAdmin.header);
      // The Owner's own token (issued at registration, still claims reader —
      // see registerAndToken()'s comment) doesn't matter here: requireRole
      // only needs SOME administrator-claiming token to reach the route, and
      // the is_owner check on the target id is what's actually under test.
      const ownerAdminToken = await issueToken(owner.userId, ROLES.ADMINISTRATOR, env.JWT_SECRET);

      const res = await app.request(
        `/users/${owner.userId}/role`,
        { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerAdminToken}` }, body: JSON.stringify({ systemRole: "reader" }) },
        env
      );
      expect(res.status).toBe(403);
    });

    it("still lets the Owner change everyone else's role normally", async () => {
      const owner = await registerAndToken(ROLES.ADMINISTRATOR);
      await makeOwner(owner.userId);
      const target = await registerAndToken(ROLES.READER);

      const res = await app.request(
        `/users/${target.userId}/role`,
        { method: "PATCH", headers: { "Content-Type": "application/json", ...owner.header }, body: JSON.stringify({ systemRole: "editor" }) },
        env
      );
      expect(res.status).toBe(200);
      expect((await json(res)).user.systemRole).toBe("editor");
    });
  });
});
