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
  const email = `bookmarks-test-${userCounter}@example.com`;
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
  return { header: { Authorization: `Bearer ${token}` } };
}

describe("GET /bookmarks", () => {
  it("requires auth", async () => {
    const res = await app.request("/bookmarks", {}, env);
    expect(res.status).toBe(401);
  });

  it("starts empty for a new reader", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/bookmarks", { headers: header }, env);
    expect(res.status).toBe(200);
    expect((await json(res)).bookmarks).toEqual([]);
  });
});

describe("POST /bookmarks/:bookId/toggle", () => {
  it("404s for an unknown book", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/bookmarks/does-not-exist/toggle", { method: "POST", headers: header }, env);
    expect(res.status).toBe(404);
  });

  it("adds then removes a bookmark on alternating calls", async () => {
    const { header } = await registerAndToken();

    const added = await app.request("/bookmarks/1/toggle", { method: "POST", headers: header }, env);
    const addedBody = await json(added);
    expect(addedBody.bookmarked).toBe(true);
    expect(addedBody.bookmarks).toEqual(["1"]);

    const removed = await app.request("/bookmarks/1/toggle", { method: "POST", headers: header }, env);
    const removedBody = await json(removed);
    expect(removedBody.bookmarked).toBe(false);
    expect(removedBody.bookmarks).toEqual([]);
  });

  it("keeps bookmarks isolated per user", async () => {
    const readerA = await registerAndToken();
    const readerB = await registerAndToken();

    await app.request("/bookmarks/1/toggle", { method: "POST", headers: readerA.header }, env);

    const bRes = await app.request("/bookmarks", { headers: readerB.header }, env);
    expect((await json(bRes)).bookmarks).toEqual([]);

    const aRes = await app.request("/bookmarks", { headers: readerA.header }, env);
    expect((await json(aRes)).bookmarks).toEqual(["1"]);
  });
});

describe("page bookmarks", () => {
  it("GET returns null when no page pin is set", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/bookmarks/1/page", { headers: header }, env);
    expect(res.status).toBe(200);
    expect((await json(res)).pageIndex).toBeNull();
  });

  it("404s a PUT for an unknown book", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/bookmarks/does-not-exist/page",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ pageIndex: 2 }) },
      env
    );
    expect(res.status).toBe(404);
  });

  it("sets a page pin, then clears it when the same pageIndex is sent again", async () => {
    const { header } = await registerAndToken();

    const setRes = await app.request(
      "/bookmarks/1/page",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ pageIndex: 3 }) },
      env
    );
    expect((await json(setRes)).pageIndex).toBe(3);

    const getRes = await app.request("/bookmarks/1/page", { headers: header }, env);
    expect((await json(getRes)).pageIndex).toBe(3);

    const clearRes = await app.request(
      "/bookmarks/1/page",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ pageIndex: 3 }) },
      env
    );
    expect((await json(clearRes)).pageIndex).toBeNull();
  });

  it("a different pageIndex replaces the pin rather than clearing it", async () => {
    const { header } = await registerAndToken();
    await app.request(
      "/bookmarks/1/page",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ pageIndex: 3 }) },
      env
    );
    const res = await app.request(
      "/bookmarks/1/page",
      { method: "PUT", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ pageIndex: 7 }) },
      env
    );
    expect((await json(res)).pageIndex).toBe(7);
  });
});
