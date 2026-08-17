import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

// Verifies the Stage 2 migration (migrations/0001_initial_schema.sql) is
// applied correctly and behaves as expected, not just that it runs without
// throwing.
describe("D1 schema — migration 0001", () => {
  it("seeds the roles lookup table", async () => {
    const { results } = await env.DB.prepare(
      "SELECT code FROM roles ORDER BY code"
    ).all<{ code: string }>();
    expect(results.map((r) => r.code)).toEqual([
      "administrator",
      "author",
      "editor",
      "publisher",
      "reader",
      "translator",
    ]);
  });

  it("seeds the languages lookup table", async () => {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM languages"
    ).first<{ count: number }>();
    expect(row?.count).toBe(11);
  });

  it("stores a book and its pages, and reads them back joined by book_id", async () => {
    await env.DB.prepare(
      `INSERT INTO books (id, title, author, language, level, total_pages, category, is_educational)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind("test-book-1", "Test Book", "Test Author", "English", "Beginner", 2, "Storybooks", 0)
      .run();

    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO book_pages (book_id, page_number, content) VALUES (?, ?, ?)"
      ).bind("test-book-1", 1, "Page one."),
      env.DB.prepare(
        "INSERT INTO book_pages (book_id, page_number, content) VALUES (?, ?, ?)"
      ).bind("test-book-1", 2, "Page two."),
    ]);

    const book = await env.DB.prepare("SELECT * FROM books WHERE id = ?")
      .bind("test-book-1")
      .first<{ title: string; attributes: string }>();
    expect(book?.title).toBe("Test Book");
    expect(book?.attributes).toBe("{}"); // default value applied

    const { results: pages } = await env.DB.prepare(
      "SELECT content FROM book_pages WHERE book_id = ? ORDER BY page_number"
    )
      .bind("test-book-1")
      .all<{ content: string }>();
    expect(pages.map((p) => p.content)).toEqual(["Page one.", "Page two."]);
  });

  it("enforces unique email on users", async () => {
    await env.DB.prepare(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
    )
      .bind("user-1", "Test User", "dup@example.com", "hash")
      .run();

    await expect(
      env.DB.prepare(
        "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
      )
        .bind("user-2", "Duplicate", "dup@example.com", "hash")
        .run()
    ).rejects.toThrow();
  });
});
