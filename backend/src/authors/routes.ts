import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";
import { listPeople, getPerson, updatePerson, toApiPerson, type PersonRow } from "../people/service";
import { toApiBook, type BookRow } from "../books/service";

const updateSchema = z.object({
  bio: z.string().trim().min(1).nullable().optional(),
  photoUrl: z.string().trim().url().nullable().optional(),
});

const authors = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Public, like GET /books — the entity is read-only browsing for anyone.
authors.get("/", async (c) => {
  const rows = await listPeople(c.env.DB, "authors");
  return c.json({ authors: rows.map(toApiPerson) });
});

// Includes the author's books (via books.author_id, backfilled/linked by
// migrations/0009 and books/service.ts's findOrCreatePerson) — an author
// profile page's main reason to exist.
authors.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await getPerson(c.env.DB, "authors", id);
  if (!row) return c.json({ error: "Author not found." }, 404);

  const { results } = await c.env.DB.prepare("SELECT * FROM books WHERE author_id = ? ORDER BY title ASC")
    .bind(id)
    .all<BookRow>();

  return c.json({ author: toApiPerson(row), books: results.map(toApiBook) });
});

// Administrator only — bio/photo only, not `name` (books.author stays the
// source of truth for the display name; renaming happens via
// PATCH /books/:id, same as any other book field).
authors.patch(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMINISTRATOR),
  zValidator("json", updateSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    try {
      await updatePerson(c.env.DB, "authors", id, body);
    } catch {
      return c.json({ error: "Author not found." }, 404);
    }

    const row = await getPerson(c.env.DB, "authors", id);
    return c.json({ author: toApiPerson(row as PersonRow) });
  }
);

export default authors;
