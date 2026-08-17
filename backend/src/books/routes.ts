import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";
import {
  type BookRow,
  toApiBook,
  toContentArray,
  estimatePages,
  getPageContent,
  replacePages,
  createBookRecord,
} from "./service";

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  isEducational: z.enum(["true", "false"]).optional(),
});

// Accepts either a single string or an array of page strings, same as the
// frontend's booksService.createBook() — normalized to an array immediately.
const contentSchema = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

const createSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  language: z.string().trim().min(1),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  category: z.string().trim().min(1),
  ageGroup: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  isEducational: z.boolean().optional(),
  content: contentSchema,
  attributes: z.record(z.unknown()).optional(),
});

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  category: z.string().trim().min(1).optional(),
  ageGroup: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  isEducational: z.boolean().optional(),
  content: contentSchema.optional(),
  // Merged into the existing bag (Schema-Driven Design), not a replacement —
  // matches booksService.updateBook()'s merge behavior, so one caller
  // setting `theme` can't accidentally wipe another attribute set
  // separately.
  attributes: z.record(z.unknown()).optional(),
});

const books = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

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

  const content = await getPageContent(c.env.DB, id);

  return c.json({ book: { ...toApiBook(bookRow), content } });
});

books.post(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMINISTRATOR),
  zValidator("json", createSchema),
  async (c) => {
    const body = c.req.valid("json");

    let id: string;
    try {
      id = await createBookRecord(c.env.DB, body);
    } catch (err) {
      return c.json({ error: `Could not create book — check the language is valid (${(err as Error).message}).` }, 400);
    }

    const bookRow = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    const content = await getPageContent(c.env.DB, id);
    return c.json({ book: { ...toApiBook(bookRow as BookRow), content } }, 201);
  }
);

books.patch(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMINISTRATOR),
  zValidator("json", updateSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const existing = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    if (!existing) {
      return c.json({ error: "Book not found." }, 404);
    }

    const mergedAttributes = body.attributes
      ? { ...JSON.parse(existing.attributes), ...body.attributes }
      : JSON.parse(existing.attributes);

    const pages = body.content ? toContentArray(body.content) : null;
    const totalPages = pages ? estimatePages(pages) : existing.total_pages;

    try {
      await c.env.DB.prepare(
        `UPDATE books SET title = ?, author = ?, language = ?, level = ?, category = ?, age_group = ?, description = ?, is_educational = ?, attributes = ?, total_pages = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
        .bind(
          body.title ?? existing.title,
          body.author ?? existing.author,
          body.language ?? existing.language,
          body.level ?? existing.level,
          body.category ?? existing.category,
          body.ageGroup ?? existing.age_group,
          body.description ?? existing.description,
          (body.isEducational ?? Boolean(existing.is_educational)) ? 1 : 0,
          JSON.stringify(mergedAttributes),
          totalPages,
          id
        )
        .run();
    } catch (err) {
      return c.json({ error: `Could not update book — check the language is valid (${(err as Error).message}).` }, 400);
    }

    if (pages) {
      await replacePages(c.env.DB, id, pages);
    }

    const updatedRow = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    const content = await getPageContent(c.env.DB, id);
    return c.json({ book: { ...toApiBook(updatedRow as BookRow), content } });
  }
);

books.delete("/:id", authMiddleware, requireRole(ROLES.ADMINISTRATOR), async (c) => {
  const id = c.req.param("id");

  const existing = await c.env.DB.prepare("SELECT id FROM books WHERE id = ?").bind(id).first();
  if (!existing) {
    return c.json({ error: "Book not found." }, 404);
  }

  // book_pages/reading_progress/bookmarks/page_bookmarks all cascade via
  // ON DELETE CASCADE (migrations/0001_initial_schema.sql).
  await c.env.DB.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export default books;
