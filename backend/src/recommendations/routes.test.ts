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
async function registerAndToken() {
  userCounter += 1;
  const email = `recs-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Test ${userCounter}`, email, password: "correcthorse" }) },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` } };
}

describe("GET /recommendations", () => {
  it("requires auth", async () => {
    const res = await app.request("/recommendations", {}, env);
    expect(res.status).toBe(401);
  });

  it("falls back to top-rated books for a brand-new reader with no history", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/recommendations", { headers: header }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.books).toHaveLength(6);
  });

  it("prefers the same category as a completed book, and excludes that book itself", async () => {
    const { header } = await registerAndToken();
    // Book '1' (Anansi the Spider) is category Storybooks — see migrations/0002_seed_books.sql.
    await app.request("/progress/1/complete", { method: "POST", headers: header }, env);

    const res = await app.request("/recommendations", { headers: header }, env);
    const body = await json(res);
    expect(body.books.some((b: { id: string }) => b.id === "1")).toBe(false);
    expect(body.books.some((b: { category: string }) => b.category === "Storybooks")).toBe(true);
  });

  it("excludes a book that's in progress but not yet completed", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/progress/1",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ currentPage: 2, totalPages: 12 }) },
      env
    );

    const res = await app.request("/recommendations", { headers: header }, env);
    const body = await json(res);
    expect(body.books.some((b: { id: string }) => b.id === "1")).toBe(false);
  });
});
