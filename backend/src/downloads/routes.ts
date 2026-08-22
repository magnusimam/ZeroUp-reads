import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { recordDownload, listDownloads, toApiDownload } from "./service";

const downloads = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

downloads.use("*", authMiddleware);

downloads.get("/", async (c) => {
  const authUser = c.get("authUser");
  const rows = await listDownloads(c.env.DB, authUser.sub);
  return c.json({ downloads: rows.map(toApiDownload) });
});

// One row per download event (not upserted) — a re-download after clearing
// local storage is still a real, separate event worth counting later (e.g.
// "most downloaded"), same reasoning as migrations/0012's own comment.
downloads.post("/:bookId", async (c) => {
  const authUser = c.get("authUser");
  const bookId = c.req.param("bookId");

  const book = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(bookId).first();
  if (!book) {
    return c.json({ error: "Book not found." }, 404);
  }

  await recordDownload(c.env.DB, authUser.sub, bookId);
  return c.json({ success: true }, 201);
});

export default downloads;
