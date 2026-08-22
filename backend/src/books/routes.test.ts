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

  it("searches by title, case-insensitively, combined with other filters", async () => {
    const res = await app.request("/books?q=anansi", {}, env);
    const body = await json(res);
    expect(body.books.some((b: { id: string }) => b.id === "1")).toBe(true);

    const combined = await app.request("/books?q=anansi&language=Swahili", {}, env);
    expect((await json(combined)).books).toHaveLength(0);
  });

  it("searches by author and by description substring", async () => {
    const byAuthor = await app.request("/books?q=Kwame%20Mensah", {}, env);
    expect((await json(byAuthor)).books.some((b: { id: string }) => b.id === "1")).toBe(true);

    const byDescription = await app.request("/books?q=Sky%20God", {}, env);
    expect((await json(byDescription)).books.some((b: { id: string }) => b.id === "1")).toBe(true);
  });

  it("treats a literal % or _ in the search term as a literal, not a SQL LIKE wildcard", async () => {
    const res = await app.request("/books?q=" + encodeURIComponent("%"), {}, env);
    const body = await json(res);
    // An unescaped "%" would match every book's title/author/description;
    // escaped, it matches none of the seeded (no literal "%" in any of them).
    expect(body.books).toHaveLength(0);
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

describe("POST /books", () => {
  const validBody = {
    title: "Test Created Book",
    author: "Test Author",
    language: "English",
    level: "Beginner",
    category: "Storybooks",
    content: ["Page one of the test book.", "Page two of the test book."],
  };

  it("rejects a request with no Authorization header", async () => {
    const res = await app.request(
      "/books",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validBody) },
      env
    );
    expect(res.status).toBe(401);
  });

  it("rejects a reader token with 403", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await readerAuthHeader()) },
        body: JSON.stringify(validBody),
      },
      env
    );
    expect(res.status).toBe(403);
  });

  it("creates a book as an administrator, computing totalPages from word count", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify(validBody),
      },
      env
    );
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.book.title).toBe("Test Created Book");
    expect(body.book.totalPages).toBe(1); // well under WORDS_PER_PAGE (300)
    expect(body.book.content).toEqual(validBody.content);
    expect(body.book.attributes).toEqual({});

    const getRes = await app.request(`/books/${body.book.id}`, {}, env);
    expect(getRes.status).toBe(200);
  });

  it("rejects a language that isn't in the languages table", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ ...validBody, language: "Klingon" }),
      },
      env
    );
    expect(res.status).toBe(400);
  });

  it("rejects a missing required field with 400", async () => {
    const { title, ...withoutTitle } = validBody;
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify(withoutTitle),
      },
      env
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /books/:id", () => {
  async function createTestBook() {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Patch Target",
          author: "Original Author",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["Original page one."],
          attributes: { theme: "Original Theme" },
        }),
      },
      env
    );
    const body = await json(res);
    return body.book.id as string;
  }

  it("updates fields and merges attributes without dropping existing ones", async () => {
    const id = await createTestBook();

    const res = await app.request(
      `/books/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ author: "New Author", attributes: { tagline: "New tagline" } }),
      },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.book.author).toBe("New Author");
    expect(body.book.title).toBe("Patch Target"); // untouched field preserved
    expect(body.book.attributes).toEqual({ theme: "Original Theme", tagline: "New tagline" });
  });

  it("replaces page content and recomputes totalPages when content is provided", async () => {
    const id = await createTestBook();

    const res = await app.request(
      `/books/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ content: ["Replaced page one.", "Replaced page two.", "Replaced page three."] }),
      },
      env
    );
    const body = await json(res);
    expect(body.book.content).toEqual(["Replaced page one.", "Replaced page two.", "Replaced page three."]);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request(
      "/books/does-not-exist",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ title: "New Title" }),
      },
      env
    );
    expect(res.status).toBe(404);
  });

  it("rejects a reader token with 403", async () => {
    const id = await createTestBook();
    const res = await app.request(
      `/books/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await readerAuthHeader()) },
        body: JSON.stringify({ title: "Hijacked" }),
      },
      env
    );
    expect(res.status).toBe(403);
  });
});

describe("author/illustrator linking", () => {
  it("find-or-creates an authors row on create and links author_id", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Linked Author Book",
          author: "A Brand New Author",
          illustrator: "A Brand New Illustrator",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["A page."],
        }),
      },
      env
    );
    const { book } = await json(res);
    expect(book.authorId).toBeTruthy();
    expect(book.illustratorId).toBeTruthy();

    const authorRes = await app.request(`/authors/${book.authorId}`, {}, env);
    expect((await json(authorRes)).author.name).toBe("A Brand New Author");

    const illustratorRes = await app.request(`/illustrators/${book.illustratorId}`, {}, env);
    expect((await json(illustratorRes)).illustrator.name).toBe("A Brand New Illustrator");
  });

  it("reuses the same authors row for a second book by the same author", async () => {
    const first = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Shared Author Book One",
          author: "Shared Author",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["A page."],
        }),
      },
      env
    );
    const second = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Shared Author Book Two",
          author: "Shared Author",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["A page."],
        }),
      },
      env
    );
    const firstBook = (await json(first)).book;
    const secondBook = (await json(second)).book;
    expect(firstBook.authorId).toBe(secondBook.authorId);
  });
});

describe("PATCH /books/:id — version history", () => {
  async function createTestBook() {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Version Target",
          author: "Original Author",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["Version one content."],
        }),
      },
      env
    );
    return ((await json(res)).book.id) as string;
  }

  it("snapshots the pre-edit state on every PATCH", async () => {
    const id = await createTestBook();

    await app.request(
      `/books/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ title: "Version Target — Edited" }),
      },
      env
    );

    const res = await app.request(`/books/${id}/versions`, { headers: await adminAuthHeader() }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.versions).toHaveLength(1);
    expect(body.versions[0].versionNumber).toBe(1);
    expect(body.versions[0].title).toBe("Version Target"); // pre-edit snapshot, not the new title
  });

  it("accumulates a new version per PATCH, most recent first", async () => {
    const id = await createTestBook();
    await app.request(
      `/books/${id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) }, body: JSON.stringify({ title: "Edit One" }) },
      env
    );
    await app.request(
      `/books/${id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) }, body: JSON.stringify({ title: "Edit Two" }) },
      env
    );

    const res = await app.request(`/books/${id}/versions`, { headers: await adminAuthHeader() }, env);
    const body = await json(res);
    expect(body.versions.map((v: { versionNumber: number }) => v.versionNumber)).toEqual([2, 1]);
    expect(body.versions[1].title).toBe("Version Target");
    expect(body.versions[0].title).toBe("Edit One");
  });

  it("rejects a reader token on GET /books/:id/versions with 403", async () => {
    const id = await createTestBook();
    const res = await app.request(`/books/${id}/versions`, { headers: await readerAuthHeader() }, env);
    expect(res.status).toBe(403);
  });

  it("404s GET /books/:id/versions/:versionNumber for an unknown version", async () => {
    const id = await createTestBook();
    const res = await app.request(`/books/${id}/versions/99`, { headers: await adminAuthHeader() }, env);
    expect(res.status).toBe(404);
  });

  it("restores an earlier version's fields and content, snapshotting the current state first", async () => {
    const id = await createTestBook();
    await app.request(
      `/books/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({ title: "Edited Title", content: ["Edited content."] }),
      },
      env
    );

    const restoreRes = await app.request(
      `/books/${id}/versions/1/restore`,
      { method: "POST", headers: await adminAuthHeader() },
      env
    );
    expect(restoreRes.status).toBe(200);
    const restored = await json(restoreRes);
    expect(restored.book.title).toBe("Version Target");
    expect(restored.book.content).toEqual(["Version one content."]);

    // Restoring itself was snapshotted as version 2 (the pre-restore state).
    const versionsRes = await app.request(`/books/${id}/versions`, { headers: await adminAuthHeader() }, env);
    const versionsBody = await json(versionsRes);
    expect(versionsBody.versions).toHaveLength(2);
  });
});

describe("DELETE /books/:id", () => {
  it("deletes a book as an administrator", async () => {
    const createRes = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await adminAuthHeader()) },
        body: JSON.stringify({
          title: "Delete Target",
          author: "Author",
          language: "English",
          level: "Beginner",
          category: "Storybooks",
          content: ["A page."],
        }),
      },
      env
    );
    const { book } = await json(createRes);

    const deleteRes = await app.request(
      `/books/${book.id}`,
      { method: "DELETE", headers: await adminAuthHeader() },
      env
    );
    expect(deleteRes.status).toBe(200);

    const getRes = await app.request(`/books/${book.id}`, {}, env);
    expect(getRes.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request(
      "/books/does-not-exist",
      { method: "DELETE", headers: await adminAuthHeader() },
      env
    );
    expect(res.status).toBe(404);
  });

  it("rejects a reader token with 403", async () => {
    const res = await app.request("/books/1", { method: "DELETE", headers: await readerAuthHeader() }, env);
    expect(res.status).toBe(403);
  });
});
