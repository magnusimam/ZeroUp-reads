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
async function registerAndToken(role: (typeof ROLES)[keyof typeof ROLES]) {
  userCounter += 1;
  const email = `analytics-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }) },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` } };
}

describe("GET /analytics", () => {
  it("requires auth", async () => {
    const res = await app.request("/analytics", {}, env);
    expect(res.status).toBe(401);
  });

  it("rejects a non-administrator", async () => {
    const { header } = await registerAndToken(ROLES.READER);
    const res = await app.request("/analytics", { headers: header }, env);
    expect(res.status).toBe(403);
  });

  it("returns the MOCK_STATS-shaped summary, reflecting real data", async () => {
    const reader = await registerAndToken(ROLES.READER);
    await app.request("/progress/1/complete", { method: "POST", headers: reader.header }, env);

    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const res = await app.request("/analytics", { headers: admin.header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);

    expect(body.totalBooks).toBe(19);
    expect(body.libraryTitles).toBe(19);
    expect(body.totalUsers).toBeGreaterThanOrEqual(2);
    expect(body.booksReadThisWeek).toBeGreaterThanOrEqual(1);
    expect(body.completionsThisWeek).toBe(body.booksReadThisWeek);
    expect(body.topBooks.length).toBeGreaterThan(0);
    expect(body.byLanguage.length).toBeGreaterThan(0);
    expect(body.byLevel.length).toBeGreaterThan(0);
    expect(typeof body.libraryReads).toBe("number");
  });
});
