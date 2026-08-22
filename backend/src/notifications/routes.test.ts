import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES } from "../config/roles";
import { createNotification } from "./service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

let userCounter = 0;
async function registerAndToken() {
  userCounter += 1;
  const email = `notif-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }) },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { userId: user.id as string, header: { Authorization: `Bearer ${token}` } };
}

describe("GET /notifications", () => {
  it("requires auth", async () => {
    const res = await app.request("/notifications", {}, env);
    expect(res.status).toBe(401);
  });

  it("lists only the caller's own notifications, newest first", async () => {
    const a = await registerAndToken();
    const b = await registerAndToken();
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "First", message: "one" });
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "Second", message: "two" });
    await createNotification(env.DB, { userId: b.userId, type: "test", title: "Not yours", message: "three" });

    const res = await app.request("/notifications", { headers: a.header }, env);
    const body = await json(res);
    expect(body.notifications).toHaveLength(2);
    expect(body.notifications[0].title).toBe("Second");
    expect(body.unreadCount).toBe(2);
  });
});

describe("PATCH /notifications/:id/read", () => {
  it("marks the caller's own notification as read", async () => {
    const a = await registerAndToken();
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "Hi", message: "hello" });
    const list = await json(await app.request("/notifications", { headers: a.header }, env));
    const id = list.notifications[0].id;

    const res = await app.request(`/notifications/${id}/read`, { method: "PATCH", headers: a.header }, env);
    expect(res.status).toBe(200);
    expect((await json(res)).notification.isRead).toBe(true);
  });

  it("404s — not 403 — for a notification that belongs to someone else", async () => {
    const a = await registerAndToken();
    const b = await registerAndToken();
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "Mine", message: "private" });
    const list = await json(await app.request("/notifications", { headers: a.header }, env));
    const id = list.notifications[0].id;

    const res = await app.request(`/notifications/${id}/read`, { method: "PATCH", headers: b.header }, env);
    expect(res.status).toBe(404);
  });
});

describe("POST /notifications/read-all", () => {
  it("marks every unread notification of the caller's as read", async () => {
    const a = await registerAndToken();
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "One", message: "1" });
    await createNotification(env.DB, { userId: a.userId, type: "test", title: "Two", message: "2" });

    const res = await app.request("/notifications/read-all", { method: "POST", headers: a.header }, env);
    expect(res.status).toBe(200);

    const list = await json(await app.request("/notifications", { headers: a.header }, env));
    expect(list.unreadCount).toBe(0);
  });
});
