import { Hono } from "hono";
import type { Env } from "../env";

type TestimonialRow = { id: string; name: string; role: string; quote: string; book_id: string | null };

const testimonials = new Hono<{ Bindings: Env }>();

// Public, like GET /books and GET /languages — this is just the frontend's
// old "Parent & Teacher Picks" section content moving off a hardcoded
// MOCK_TESTIMONIALS array and onto the migrations/0014 seed. Read-only: no
// create/update/delete route exists, same as the frontend service it
// replaces.
testimonials.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, quote, book_id FROM testimonials ORDER BY id ASC"
  ).all<TestimonialRow>();
  return c.json({
    testimonials: results.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      quote: row.quote,
      bookId: row.book_id,
    })),
  });
});

export default testimonials;
