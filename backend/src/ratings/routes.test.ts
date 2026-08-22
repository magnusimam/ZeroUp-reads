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
  const email = `ratings-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Rater ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` }, userId: user.id as string };
}

describe("GET /ratings/:bookId", () => {
  it("is public and starts at zero for a book with no ratings", async () => {
    const res = await app.request("/ratings/2", {}, env);
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ average: 0, count: 0 });
  });

  it("404s for an unknown book", async () => {
    const res = await app.request("/ratings/does-not-exist", {}, env);
    expect(res.status).toBe(404);
  });
});

describe("PUT /ratings/:bookId", () => {
  it("requires auth", async () => {
    const res = await app.request(
      "/ratings/3",
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: 5 }) },
      env
    );
    expect(res.status).toBe(401);
  });

  it("rejects a rating outside 1-5", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/ratings/3",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 6 }) },
      env
    );
    expect(res.status).toBe(400);
  });

  it("sets a rating and it's reflected in the aggregate", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/ratings/3",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 4 }) },
      env
    );
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ average: 4, count: 1 });
  });

  it("upserts — a second rating from the same user replaces, not adds", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/ratings/4",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 2 }) },
      env
    );
    const res = await app.request(
      "/ratings/4",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 5 }) },
      env
    );
    expect(await json(res)).toEqual({ average: 5, count: 1 });
  });

  it("averages ratings from different users", async () => {
    const a = await registerAndToken();
    const b = await registerAndToken();
    await app.request("/ratings/5", { method: "PUT", headers: { "Content-Type": "application/json", ...a.header }, body: JSON.stringify({ rating: 3 }) }, env);
    const res = await app.request("/ratings/5", { method: "PUT", headers: { "Content-Type": "application/json", ...b.header }, body: JSON.stringify({ rating: 5 }) }, env);
    expect(await json(res)).toEqual({ average: 4, count: 2 });
  });
});

describe("GET /ratings/:bookId/mine", () => {
  it("returns null before rating, then the caller's own rating after", async () => {
    const { header } = await registerAndToken();
    const before = await app.request("/ratings/6/mine", { headers: header }, env);
    expect((await json(before)).rating).toBeNull();

    await app.request("/ratings/6", { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 3 }) }, env);
    const after = await app.request("/ratings/6/mine", { headers: header }, env);
    expect((await json(after)).rating).toBe(3);
  });
});

describe("DELETE /ratings/:bookId", () => {
  it("removes the caller's own rating", async () => {
    const { header } = await registerAndToken();
    await app.request("/ratings/7", { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ rating: 5 }) }, env);
    const res = await app.request("/ratings/7", { method: "DELETE", headers: header }, env);
    expect(await json(res)).toEqual({ average: 0, count: 0 });
  });
});
