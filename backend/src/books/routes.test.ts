import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

describe("GET /books", () => {
  it("returns all seeded books", async () => {
    const res = await app.request("/books", {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.books).toHaveLength(19);
  });

  it("includes parsed attributes on list items, not a raw JSON string", async () => {
    const res = await app.request("/books", {}, env);
    const body = await json(res);
    const anansi = body.books.find((b: { id: string }) => b.id === "1");
    expect(anansi.attributes).toEqual({ theme: "Folktales & Legends" });
  });

  it("filters by category", async () => {
    const res = await app.request("/books?category=Storybooks", {}, env);
    const body = await json(res);
    expect(body.books.length).toBeGreaterThan(0);
    expect(body.books.every((b: { category: string }) => b.category === "Storybooks")).toBe(true);
  });

  it("filters by language", async () => {
    const res = await app.request("/books?language=Yoruba", {}, env);
    const body = await json(res);
    expect(body.books.length).toBeGreaterThan(0);
    expect(body.books.every((b: { language: string }) => b.language === "Yoruba")).toBe(true);
  });

  it("filters by level", async () => {
    const res = await app.request("/books?level=Advanced", {}, env);
    const body = await json(res);
    expect(body.books.length).toBeGreaterThan(0);
    expect(body.books.every((b: { level: string }) => b.level === "Advanced")).toBe(true);
  });

  it("filters by isEducational", async () => {
    const res = await app.request("/books?isEducational=false", {}, env);
    const body = await json(res);
    expect(body.books.length).toBeGreaterThan(0);
    expect(body.books.every((b: { isEducational: boolean }) => b.isEducational === false)).toBe(true);
  });

  it("combines multiple filters with AND", async () => {
    const res = await app.request("/books?category=Storybooks&language=Swahili", {}, env);
    const body = await json(res);
    expect(body.books.length).toBeGreaterThan(0);
    expect(
      body.books.every(
        (b: { category: string; language: string }) => b.category === "Storybooks" && b.language === "Swahili"
      )
    ).toBe(true);
  });

  it("returns an empty list for a filter combination that matches nothing", async () => {
    const res = await app.request("/books?category=Storybooks&language=Kanuri", {}, env);
    const body = await json(res);
    expect(body.books).toEqual([]);
  });
});

describe("GET /books/:id", () => {
  it("returns full detail including ordered page content", async () => {
    const res = await app.request("/books/1", {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.book.title).toBe("Anansi the Spider");
    expect(body.book.content).toHaveLength(5);
    expect(body.book.content[0]).toContain("Anansi was a clever spider");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request("/books/does-not-exist", {}, env);
    expect(res.status).toBe(404);
  });
});
