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
  const email = `collections-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Curator ${userCounter}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, ROLES.READER, env.JWT_SECRET);
  return { header: { Authorization: `Bearer ${token}` } };
}

describe("POST /collections", () => {
  it("requires auth", async () => {
    const res = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "My List" }) },
      env
    );
    expect(res.status).toBe(401);
  });

  it("creates a private-by-default collection owned by the caller", async () => {
    const { header } = await registerAndToken();
    const res = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name: "My List" }) },
      env
    );
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.collection.name).toBe("My List");
    expect(body.collection.isPublic).toBe(false);
  });
});

describe("GET /collections & /collections/:id — visibility", () => {
  it("a guest sees public collections but not another user's private ones", async () => {
    const { header } = await registerAndToken();
    const pub = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name: "Public List", isPublic: true }) },
      env
    );
    const priv = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name: "Private List" }) },
      env
    );
    const pubId = (await json(pub)).collection.id;
    const privId = (await json(priv)).collection.id;

    const listRes = await app.request("/collections", {}, env);
    const ids = (await json(listRes)).collections.map((col: { id: string }) => col.id);
    expect(ids).toContain(pubId);
    expect(ids).not.toContain(privId);

    const getPriv = await app.request(`/collections/${privId}`, {}, env);
    expect(getPriv.status).toBe(404);
  });

  it("the owner sees their own private collection", async () => {
    const { header } = await registerAndToken();
    const created = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name: "Owner Only" }) },
      env
    );
    const id = (await json(created)).collection.id;

    const res = await app.request(`/collections/${id}`, { headers: header }, env);
    expect(res.status).toBe(200);
    expect((await json(res)).collection.name).toBe("Owner Only");
  });
});

describe("collection membership & management", () => {
  async function createCollection(header: Record<string, string>, name = "Books List") {
    const res = await app.request(
      "/collections",
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name }) },
      env
    );
    return (await json(res)).collection.id as string;
  }

  it("adds and removes a book", async () => {
    const { header } = await registerAndToken();
    const id = await createCollection(header);

    const addRes = await app.request(
      `/collections/${id}/books`,
      { method: "POST", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ bookId: "1" }) },
      env
    );
    expect(addRes.status).toBe(200);
    expect((await json(addRes)).books.map((b: { id: string }) => b.id)).toEqual(["1"]);

    const removeRes = await app.request(`/collections/${id}/books/1`, { method: "DELETE", headers: header }, env);
    expect((await json(removeRes)).books).toEqual([]);
  });

  it("404s adding a book to another user's collection", async () => {
    const owner = await registerAndToken();
    const intruder = await registerAndToken();
    const id = await createCollection(owner.header);

    const res = await app.request(
      `/collections/${id}/books`,
      { method: "POST", headers: { "Content-Type": "application/json", ...intruder.header }, body: JSON.stringify({ bookId: "1" }) },
      env
    );
    expect(res.status).toBe(404);
  });

  it("renames a collection the caller owns", async () => {
    const { header } = await registerAndToken();
    const id = await createCollection(header, "Old Name");
    const res = await app.request(
      `/collections/${id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...header }, body: JSON.stringify({ name: "New Name" }) },
      env
    );
    expect((await json(res)).collection.name).toBe("New Name");
  });

  it("deletes a collection the caller owns", async () => {
    const { header } = await registerAndToken();
    const id = await createCollection(header);
    const res = await app.request(`/collections/${id}`, { method: "DELETE", headers: header }, env);
    expect(res.status).toBe(200);

    const getRes = await app.request(`/collections/${id}`, { headers: header }, env);
    expect(getRes.status).toBe(404);
  });
});
