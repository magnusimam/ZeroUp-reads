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

// Mirrors authors/routes.ts exactly — same entity shape (migrations/0009),
// just the illustrators table/FK instead of authors. No book currently has
// an illustrator name recorded (see migrations/0009's comment), so `books`
// will legitimately come back empty until POST/PATCH /books supplies one.
const illustrators = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

illustrators.get("/", async (c) => {
  const rows = await listPeople(c.env.DB, "illustrators");
  return c.json({ illustrators: rows.map(toApiPerson) });
});

illustrators.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await getPerson(c.env.DB, "illustrators", id);
  if (!row) return c.json({ error: "Illustrator not found." }, 404);

  const { results } = await c.env.DB.prepare("SELECT * FROM books WHERE illustrator_id = ? ORDER BY title ASC")
    .bind(id)
    .all<BookRow>();

  return c.json({ illustrator: toApiPerson(row), books: results.map(toApiBook) });
});

illustrators.patch(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMINISTRATOR),
  zValidator("json", updateSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    try {
      await updatePerson(c.env.DB, "illustrators", id, body);
    } catch {
      return c.json({ error: "Illustrator not found." }, 404);
    }

    const row = await getPerson(c.env.DB, "illustrators", id);
    return c.json({ illustrator: toApiPerson(row as PersonRow) });
  }
);

export default illustrators;
