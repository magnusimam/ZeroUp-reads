import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

let userCounter = 0;

// reading_progress/user_stats rows FK-reference users(id) — same reason
// publishing/routes.test.ts registers a real user rather than fabricating a
// JWT subject.
async function registerAndToken() {
  userCounter += 1;
  const email = `progress-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Reader ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { userId: user.id as string, header: { Authorization: `Bearer ${token}` } };
}

describe("GET /progress", () => {
  it("requires auth", async () => {
    const res = await app.request("/progress", {}, env);
    expect(res.status).toBe(401);
  });

  it("returns zeroed stats and no in-progress books for a brand-new reader", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/progress", { headers: header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.stats).toMatchObject({
      booksCompleted: 0,
      pagesRead: 0,
      streak: 0,
      booksCompletedThisWeek: 0,
      readingPoints: 0,
    });
    expect(body.stats.weeklyActivity).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(body.inProgress).toEqual({});
  });
});

describe("PUT /progress/:bookId", () => {
  it("404s for an unknown book", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/progress/does-not-exist",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 1, totalPages: 5 }) },
      env
    );
    expect(res.status).toBe(404);
  });

  it("400s on an invalid body", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: -1, totalPages: 5 }) },
      env
    );
    expect(res.status).toBe(400);
  });

  it("records position and bumps the streak to 1", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 2, totalPages: 5 }) },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.inProgress["1"]).toEqual({ currentPage: 2, totalPages: 5 });
    expect(body.stats.streak).toBe(1);
    expect(body.stats.weeklyActivity).toHaveLength(7);
  });

  it("accumulates weekly reading minutes across several page turns", async () => {
    const { header } = await registerAndToken();
    // A single page turn adds ~0.025h, which rounds away to 0.0 (matches the
    // frontend's own Math.round(x*10)/10 behavior) — several turns are
    // needed before the bucket reads as nonzero.
    for (let page = 1; page <= 5; page += 1) {
      await app.request(
        "/progress/1",
        { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: page, totalPages: 10 }) },
        env
      );
    }
    const res = await app.request("/progress", { headers: header }, env);
    const body = await json(res);
    expect(body.stats.weeklyActivity.some((h: number) => h > 0)).toBe(true);
  });

  it("does not double-count the streak for a second call on the same day", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 1, totalPages: 5 }) },
      env
    );
    const res = await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 2, totalPages: 5 }) },
      env
    );
    const body = await json(res);
    expect(body.stats.streak).toBe(1);
    expect(body.inProgress["1"].currentPage).toBe(2);
  });
});

describe("POST /progress/:bookId/complete", () => {
  it("404s for an unknown book", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/progress/does-not-exist/complete", { method: "POST", headers: header }, env);
    expect(res.status).toBe(404);
  });

  it("moves a book out of in-progress and into lifetime stats, and lists it in completedBookIds", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 3, totalPages: 5 }) },
      env
    );

    const res = await app.request("/progress/1/complete", { method: "POST", headers: header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.stats.booksCompleted).toBe(1);
    expect(body.stats.booksCompletedThisWeek).toBe(1);
    expect(body.stats.pagesRead).toBeGreaterThan(0);
    expect(body.inProgress).toEqual({});
    expect(body.completedBookIds).toEqual(["1"]);
  });

  it("orders completedBookIds oldest-first as books actually finish", async () => {
    const { header } = await registerAndToken();
    await app.request("/progress/1/complete", { method: "POST", headers: header }, env);
    const res = await app.request("/progress/2/complete", { method: "POST", headers: header }, env);
    const body = await json(res);
    expect(body.completedBookIds).toEqual(["1", "2"]);
  });

  it("is idempotent — completing the same book twice only counts once", async () => {
    const { header } = await registerAndToken();
    await app.request("/progress/1/complete", { method: "POST", headers: header }, env);
    const res = await app.request("/progress/1/complete", { method: "POST", headers: header }, env);
    const body = await json(res);
    expect(body.stats.booksCompleted).toBe(1);
    expect(body.stats.booksCompletedThisWeek).toBe(1);
  });

  it("a later PUT for an already-completed book bumps the streak but leaves it out of in-progress", async () => {
    const { header } = await registerAndToken();
    await app.request("/progress/1/complete", { method: "POST", headers: header }, env);
    const res = await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 1, totalPages: 5 }) },
      env
    );
    const body = await json(res);
    expect(body.stats.streak).toBe(1);
    expect(body.inProgress).toEqual({});
  });
});
