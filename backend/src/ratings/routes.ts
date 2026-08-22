import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { MIN_RATING, MAX_RATING } from "../config/rules";
import { getRatingSummary, getMyRating, setRating, deleteRating } from "./service";

const setRatingSchema = z.object({
  rating: z.number().int().min(MIN_RATING).max(MAX_RATING),
});

async function bookExists(db: D1Database, bookId: string): Promise<boolean> {
  return Boolean(await db.prepare("SELECT 1 FROM books WHERE id = ?").bind(bookId).first());
}

const ratings = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Public — an aggregate rating is browsable content, like a book's rating
// field always was.
ratings.get("/:bookId", async (c) => {
  const bookId = c.req.param("bookId");
  if (!(await bookExists(c.env.DB, bookId))) {
    return c.json({ error: "Book not found." }, 404);
  }
  return c.json(await getRatingSummary(c.env.DB, bookId));
});

ratings.get("/:bookId/mine", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  if (!(await bookExists(c.env.DB, bookId))) {
    return c.json({ error: "Book not found." }, 404);
  }
  return c.json({ rating: await getMyRating(c.env.DB, bookId, authUser.sub) });
});

// PUT, not POST — idempotent set, same posture as PUT /bookmarks/:bookId/page.
ratings.put("/:bookId", authMiddleware, zValidator("json", setRatingSchema), async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  const { rating } = c.req.valid("json");

  if (!(await bookExists(c.env.DB, bookId))) {
    return c.json({ error: "Book not found." }, 404);
  }

  await setRating(c.env.DB, bookId, authUser.sub, rating);
  return c.json(await getRatingSummary(c.env.DB, bookId));
});

ratings.delete("/:bookId", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  await deleteRating(c.env.DB, bookId, authUser.sub);
  return c.json(await getRatingSummary(c.env.DB, bookId));
});

export default ratings;
