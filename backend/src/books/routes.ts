import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";

type BookRow = {
  id: string;
  title: string;
  author: string;
  language: string;
  level: string;
  total_pages: number;
  category: string;
  age_group: string | null;
  rating: number;
  reads: number;
  description: string | null;
  is_educational: number;
  attributes: string;
  created_at: string;
  updated_at: string;
};

// Maps the DB row (snake_case, attributes as a JSON string) to the shape the
// frontend's mock data already uses (camelCase, attributes as a real
// object) — same "one boundary, no reshaping at the call site" seam as
// auth/routes.ts's toSafeUser.
function toApiBook(row: BookRow) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    language: row.language,
    level: row.level,
    totalPages: row.total_pages,
    category: row.category,
    ageGroup: row.age_group,
    rating: row.rating,
    reads: row.reads,
    description: row.description,
    isEducational: Boolean(row.is_educational),
    attributes: JSON.parse(row.attributes),
  };
}

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  isEducational: z.enum(["true", "false"]).optional(),
});

const books = new Hono<{ Bindings: Env }>();

books.get("/", zValidator("query", listQuerySchema), async (c) => {
  const { category, language, level, isEducational } = c.req.valid("query");

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }
  if (language) {
    conditions.push("language = ?");
    params.push(language);
  }
  if (level) {
    conditions.push("level = ?");
    params.push(level);
  }
  if (isEducational !== undefined) {
    conditions.push("is_educational = ?");
    params.push(isEducational === "true" ? 1 : 0);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM books ${whereClause} ORDER BY title ASC`
  )
    .bind(...params)
    .all<BookRow>();

  return c.json({ books: results.map(toApiBook) });
});

books.get("/:id", async (c) => {
  const id = c.req.param("id");

  const bookRow = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
  if (!bookRow) {
    return c.json({ error: "Book not found." }, 404);
  }

  const { results: pageRows } = await c.env.DB.prepare(
    "SELECT content FROM book_pages WHERE book_id = ? ORDER BY page_number ASC"
  )
    .bind(id)
    .all<{ content: string }>();

  return c.json({
    book: {
      ...toApiBook(bookRow),
      content: pageRows.map((row) => row.content),
    },
  });
});

export default books;
