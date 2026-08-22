import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

async function adminAuthHeader() {
  const token = await issueToken("admin-test-user", ROLES.ADMINISTRATOR, env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

async function readerAuthHeader() {
  const token = await issueToken("reader-test-user", ROLES.READER, env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

describe("GET /authors", () => {
  it("is public and lists the migration-backfilled authors", async () => {
    const res = await app.request("/authors", {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.authors.length).toBeGreaterThan(0);
    expect(body.authors.some((a: { name: string }) => a.name === "Kwame Mensah")).toBe(true);
  });
});

describe("GET /authors/:id", () => {
  it("returns the author's books", async () => {
    const listRes = await app.request("/authors", {}, env);
    const kwame = (await json(listRes)).authors.find((a: { name: string }) => a.name === "Kwame Mensah");

    const res = await app.request(`/authors/${kwame.id}`, {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.author.name).toBe("Kwame Mensah");
    expect(body.books.some((b: { title: string }) => b.title === "Anansi the Spider")).toBe(true);
  });

  it("404s for an unknown id", async () => {
    const res = await app.request("/authors/does-not-exist", {}, env);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /authors/:id", () => {
  it("updates bio/photoUrl as an administrator", async () => {
    const listRes = await app.request("/authors", {}, env);
    const kwame = (await json(listRes)).authors.find((a: { name: string }) => a.name === "Kwame Mensah");

    const res = await app.request(
      `/authors/${kwame.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ bio: "A celebrated storyteller.", photoUrl: "https://example.com/kwame.jpg" }),
      },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.author.bio).toBe("A celebrated storyteller.");
    expect(body.author.photoUrl).toBe("https://example.com/kwame.jpg");
    expect(body.author.name).toBe("Kwame Mensah"); // name untouched
  });

  it("rejects a reader token with 403", async () => {
    const listRes = await app.request("/authors", {}, env);
    const kwame = (await json(listRes)).authors[0];
    const res = await app.request(
      `/authors/${kwame.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await readerAuthHeader()) },
        body: JSON.stringify({ bio: "Hijacked." }),
      },
      env
    );
    expect(res.status).toBe(403);
  });

  it("404s for an unknown id", async () => {
    const res = await app.request(
      "/authors/does-not-exist",
      { method: "PATCH", headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) }, body: JSON.stringify({ bio: "x" }) },
      env
    );
    expect(res.status).toBe(404);
  });
});
