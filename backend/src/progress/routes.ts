import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { getProgressState, recordProgress, completeBook } from "./service";

const putProgressSchema = z.object({
  currentPage: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});

const progress = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

progress.use("*", authMiddleware);

progress.get("/", async (c) => {
  const authUser = c.get("authUser");
  return c.json(await getProgressState(c.env.DB, authUser.sub));
});

progress.put("/:bookId", zValidator("json", putProgressSchema), async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");
  const { currentPage, totalPages } = c.req.valid("json");

  const book = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(bookId).first();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  await recordProgress(c.env.DB, authUser.sub, bookId, currentPage, totalPages);
  return c.json(await getProgressState(c.env.DB, authUser.sub));
});

progress.post("/:bookId/complete", async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");

  const book = await c.env.DB.prepare("SELECT total_pages FROM books WHERE id = ?")
    .bind(bookId)
    .first<{ total_pages: number }>();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  await completeBook(c.env.DB, authUser.sub, bookId, book.total_pages);
  return c.json(await getProgressState(c.env.DB, authUser.sub));
});

export default progress;
