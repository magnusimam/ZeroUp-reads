import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { listReviews, setReview, deleteReview, toApiReview } from "./service";

const setReviewSchema = z.object({
  reviewText: z.string().trim().min(1).max(2000),
});

async function bookExists(db: D1Database, bookId: string): Promise<boolean> {
  return Boolean(await db.prepare("SELECT 1 FROM books WHERE id = ?").bind(bookId).first());
}

const reviews = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

reviews.get("/:bookId", async (c) => {
  const bookId = c.req.param("bookId");
  if (!(await bookExists(c.env.DB, bookId))) {
    return c.json({ error: "Book not found." }, 404);
  }
  const rows = await listReviews(c.env.DB, bookId);
  return c.json({ reviews: rows.map(toApiReview) });
});

// PUT — idempotent set (a second call edits the caller's own review rather
// than creating a duplicate), same posture as ratings/routes.ts.
reviews.put("/:bookId", authMiddleware, zValidator("json", setReviewSchema), async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  const { reviewText } = c.req.valid("json");

  if (!(await bookExists(c.env.DB, bookId))) {
    return c.json({ error: "Book not found." }, 404);
  }

  await setReview(c.env.DB, bookId, authUser.sub, reviewText);
  const rows = await listReviews(c.env.DB, bookId);
  const mine = rows.find((r) => r.user_id === authUser.sub);
  return c.json({ review: mine ? toApiReview(mine) : null });
});

reviews.delete("/:bookId", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  await deleteReview(c.env.DB, bookId, authUser.sub);
  return c.json({ success: true });
});

export default reviews;
