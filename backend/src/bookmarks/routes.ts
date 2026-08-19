import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";

const pageBookmarkSchema = z.object({
  pageIndex: z.number().int().nonnegative(),
});

async function getBookmarkIds(db: D1Database, userId: string): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT book_id FROM bookmarks WHERE user_id = ? ORDER BY created_at ASC")
    .bind(userId)
    .all<{ book_id: string }>();
  return results.map((row) => row.book_id);
}

const bookmarks = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

bookmarks.use("*", authMiddleware);

// Mirrors bookmarksService.js's getBookmarks() — the book-level "Save" list.
bookmarks.get("/", async (c) => {
  const authUser = c.get("authUser");
  return c.json({ bookmarks: await getBookmarkIds(c.env.DB, authUser.sub) });
});

// Mirrors bookmarksService.js's toggleBookmark().
bookmarks.post("/:bookId/toggle", async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");

  const book = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(bookId).first();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  const existing = await c.env.DB.prepare("SELECT 1 FROM bookmarks WHERE user_id = ? AND book_id = ?")
    .bind(authUser.sub, bookId)
    .first();

  if (existing) {
    await c.env.DB.prepare("DELETE FROM bookmarks WHERE user_id = ? AND book_id = ?").bind(authUser.sub, bookId).run();
  } else {
    await c.env.DB.prepare("INSERT INTO bookmarks (user_id, book_id) VALUES (?, ?)").bind(authUser.sub, bookId).run();
  }

  return c.json({ bookmarked: !existing, bookmarks: await getBookmarkIds(c.env.DB, authUser.sub) });
});

// Mirrors bookmarksService.js's getPageBookmark()/setPageBookmark() — a
// separate, page-level pin distinct from the book-level "Save" above (one
// pin per user per book).
bookmarks.get("/:bookId/page", async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");

  const row = await c.env.DB.prepare("SELECT page_index FROM page_bookmarks WHERE user_id = ? AND book_id = ?")
    .bind(authUser.sub, bookId)
    .first<{ page_index: number }>();

  return c.json({ pageIndex: row ? row.page_index : null });
});

// Toggles: calling again with the same pageIndex clears the bookmark instead
// of re-setting it, matching bookmarksService.js's setPageBookmark().
bookmarks.put("/:bookId/page", zValidator("json", pageBookmarkSchema), async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  const { pageIndex } = c.req.valid("json");

  const book = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(bookId).first();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  const existing = await c.env.DB.prepare("SELECT page_index FROM page_bookmarks WHERE user_id = ? AND book_id = ?")
    .bind(authUser.sub, bookId)
    .first<{ page_index: number }>();

  if (existing?.page_index === pageIndex) {
    await c.env.DB.prepare("DELETE FROM page_bookmarks WHERE user_id = ? AND book_id = ?").bind(authUser.sub, bookId).run();
    return c.json({ pageIndex: null });
  }

  await c.env.DB.prepare(
    `INSERT INTO page_bookmarks (user_id, book_id, page_index) VALUES (?, ?, ?)
     ON CONFLICT (user_id, book_id) DO UPDATE SET page_index = excluded.page_index`
  )
    .bind(authUser.sub, bookId, pageIndex)
    .run();

  return c.json({ pageIndex });
});

export default bookmarks;
