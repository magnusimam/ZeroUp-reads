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
  const email = `downloads-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Downloader ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` } };
}

describe("GET /downloads", () => {
  it("requires auth", async () => {
    const res = await app.request("/downloads", {}, env);
    expect(res.status).toBe(401);
  });

  it("starts empty for a new reader", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/downloads", { headers: header }, env);
    expect(res.status).toBe(200);
    expect((await json(res)).downloads).toEqual([]);
  });
});

describe("POST /downloads/:bookId", () => {
  it("404s for an unknown book", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/downloads/does-not-exist", { method: "POST", headers: header }, env);
    expect(res.status).toBe(404);
  });

  it("records a download, visible in the caller's history", async () => {
    const { header } = await registerAndToken();
    const res = await app.request("/downloads/1", { method: "POST", headers: header }, env);
    expect(res.status).toBe(201);

    const listRes = await app.request("/downloads", { headers: header }, env);
    const body = await json(listRes);
    expect(body.downloads).toHaveLength(1);
    expect(body.downloads[0].bookId).toBe("1");
  });

  it("records a second event (not deduped) on a repeat download", async () => {
    const { header } = await registerAndToken();
    await app.request("/downloads/1", { method: "POST", headers: header }, env);
    await app.request("/downloads/1", { method: "POST", headers: header }, env);

    const listRes = await app.request("/downloads", { headers: header }, env);
    expect((await json(listRes)).downloads).toHaveLength(2);
  });

  it("keeps download history isolated per user", async () => {
    const a = await registerAndToken();
    const b = await registerAndToken();
    await app.request("/downloads/1", { method: "POST", headers: a.header }, env);

    const bRes = await app.request("/downloads", { headers: b.header }, env);
    expect((await json(bRes)).downloads).toEqual([]);
  });
});
