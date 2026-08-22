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

async function createBookWithIllustrator(name: string) {
  const res = await app.request(
    "/books",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
      body: JSON.stringify({
        title: `Illustrated Book by ${name}`,
        author: "Some Author",
        illustrator: name,
        language: "English",
        level: "Beginner",
        category: "Storybooks",
        content: ["A page."],
      }),
    },
    env
  );
  return (await json(res)).book;
}

describe("GET /illustrators", () => {
  it("starts without the migration seed (no book ever had one) but reflects a newly-linked illustrator", async () => {
    const book = await createBookWithIllustrator("A Test Illustrator");
    const res = await app.request("/illustrators", {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.illustrators.some((i: { id: string }) => i.id === book.illustratorId)).toBe(true);
  });
});

describe("GET /illustrators/:id", () => {
  it("returns the illustrator's books", async () => {
    const book = await createBookWithIllustrator("Another Test Illustrator");
    const res = await app.request(`/illustrators/${book.illustratorId}`, {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.illustrator.name).toBe("Another Test Illustrator");
    expect(body.books.some((b: { id: string }) => b.id === book.id)).toBe(true);
  });

  it("404s for an unknown id", async () => {
    const res = await app.request("/illustrators/does-not-exist", {}, env);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /illustrators/:id", () => {
  it("updates bio as an administrator", async () => {
    const book = await createBookWithIllustrator("Bio Test Illustrator");
    const res = await app.request(
      `/illustrators/${book.illustratorId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ bio: "Paints in watercolor." }),
      },
      env
    );
    expect(res.status).toBe(200);
    expect((await json(res)).illustrator.bio).toBe("Paints in watercolor.");
  });
});
