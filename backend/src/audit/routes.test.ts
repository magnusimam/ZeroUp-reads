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
  const email = `audit-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }) },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { userId: user.id as string, header: { Authorization: `Bearer ${token}` } };
}

describe("GET /audit-log", () => {
  it("requires auth and Administrator role", async () => {
    expect((await app.request("/audit-log", {}, env)).status).toBe(401);
    const reader = await registerAndToken(ROLES.READER);
    expect((await app.request("/audit-log", { headers: reader.header }, env)).status).toBe(403);
  });

  it("records a role change, newest first", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const target = await registerAndToken(ROLES.READER);
    await app.request(
      `/users/${target.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "editor" }) },
      env
    );

    const res = await app.request("/audit-log", { headers: admin.header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    const entry = body.entries.find((e: { entityId: string }) => e.entityId === target.userId);
    expect(entry.action).toBe("role_changed");
    expect(entry.metadata).toEqual({ from: "reader", to: "editor" });
    expect(entry.actorId).toBe(admin.userId);
  });

  it("records a denied attempt to change the Owner's role", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const owner = await registerAndToken(ROLES.READER);
    await app.request(
      `/users/${owner.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "administrator" }) },
      env
    );
    await env.DB.prepare("UPDATE users SET is_owner = 1 WHERE id = ?").bind(owner.userId).run();

    await app.request(
      `/users/${owner.userId}/role`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...admin.header }, body: JSON.stringify({ systemRole: "reader" }) },
      env
    );

    const res = await app.request("/audit-log", { headers: admin.header }, env);
    const body = await json(res);
    const entry = body.entries.find(
      (e: { entityId: string; action: string }) => e.entityId === owner.userId && e.action === "role_change_denied_owner"
    );
    expect(entry).toBeTruthy();
  });

  it("records a book deletion", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const created = await json(
      await app.request(
        "/books",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...admin.header },
          body: JSON.stringify({ title: "Audit Test Book", author: "A", language: "English", level: "Beginner", category: "Storybooks", content: ["Page one."] }),
        },
        env
      )
    );
    await app.request(`/books/${created.book.id}`, { method: "DELETE", headers: admin.header }, env);

    const res = await app.request("/audit-log", { headers: admin.header }, env);
    const body = await json(res);
    const entry = body.entries.find((e: { entityId: string }) => e.entityId === created.book.id);
    expect(entry.action).toBe("book_deleted");
    expect(entry.metadata).toEqual({ title: "Audit Test Book" });
  });
});
