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
  const email = `reviews-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Reviewer ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` }, name: `Reviewer ${userCounter}` };
}

describe("GET /reviews/:bookId", () => {
  it("is public and starts empty", async () => {
    const res = await app.request("/reviews/8", {}, env);
    expect(res.status).toBe(200);
    expect((await json(res)).reviews).toEqual([]);
  });

  it("404s for an unknown book", async () => {
    const res = await app.request("/reviews/does-not-exist", {}, env);
    expect(res.status).toBe(404);
  });
});

describe("PUT /reviews/:bookId", () => {
  it("requires auth", async () => {
    const res = await app.request(
      "/reviews/9",
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewText: "Great book!" }) },
      env
    );
    expect(res.status).toBe(401);
  });

  it("creates a review with the reviewer's name attached", async () => {
    const { header, name } = await registerAndToken();
    const res = await app.request(
      "/reviews/9",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ reviewText: "Loved it." }) },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.review.reviewText).toBe("Loved it.");
    expect(body.review.reviewerName).toBe(name);

    const listRes = await app.request("/reviews/9", {}, env);
    expect((await json(listRes)).reviews).toHaveLength(1);
  });

  it("upserts — editing keeps one review per user per book, same id", async () => {
    const { header } = await registerAndToken();
    const first = await app.request(
      "/reviews/10",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ reviewText: "First draft." }) },
      env
    );
    const second = await app.request(
      "/reviews/10",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ reviewText: "Revised." }) },
      env
    );
    const firstBody = await json(first);
    const secondBody = await json(second);
    expect(secondBody.review.id).toBe(firstBody.review.id);
    expect(secondBody.review.reviewText).toBe("Revised.");

    const listRes = await app.request("/reviews/10", {}, env);
    expect((await json(listRes)).reviews).toHaveLength(1);
  });
});

describe("DELETE /reviews/:bookId", () => {
  it("removes the caller's own review", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/reviews/11",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ reviewText: "Temporary." }) },
      env
    );
    const res = await app.request("/reviews/11", { method: "DELETE", headers: header }, env);
    expect(res.status).toBe(200);

    const listRes = await app.request("/reviews/11", {}, env);
    expect((await json(listRes)).reviews).toEqual([]);
  });
});
