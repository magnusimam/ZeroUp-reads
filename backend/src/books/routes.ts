import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";
import {
  type BookRow,
  type BookVersionRow,
  toApiBook,
  toApiBookVersion,
  toContentArray,
  estimatePages,
  getPageContent,
  replacePages,
  createBookRecord,
  snapshotBookVersion,
} from "./service";
import { writeAuditLog } from "../audit/service";
import { getActorName } from "../users/service";
import { findOrCreatePerson } from "../people/service";

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  isEducational: z.enum(["true", "false"]).optional(),
  q: z.string().trim().min(1).optional(),
});

// Escapes SQLite LIKE's own wildcards (%, _) out of a user-supplied search
// term before it's wrapped in %...% — otherwise someone typing a literal "%"
// or "_" gets unintended wildcard matching instead of a literal substring
// search (the LIKE equivalent of not escaping regex metacharacters).
function escapeLikeTerm(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

// Accepts either a single string or an array of page strings, same as the
// frontend's booksService.createBook() — normalized to an array immediately.
const contentSchema = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

const createSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  // Optional — most books today have no recorded illustrator (see
  // migrations/0009_authors_illustrators.sql). When given, find-or-creates
  // an illustrators row the same way `author` always does.
  illustrator: z.string().trim().min(1).optional(),
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
  illustrator: z.string().trim().min(1).optional(),
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
  const { category, language, level, isEducational, q } = c.req.valid("query");

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
  if (q) {
    const like = `%${escapeLikeTerm(q)}%`;
    conditions.push(
      "(title LIKE ? ESCAPE '\\' OR author LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')"
    );
    params.push(like, like, like);
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
    const authUser = c.get("authUser");

    const existing = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    if (!existing) {
      return c.json({ error: "Book not found." }, 404);
    }

    // Snapshot the pre-edit state (BookVersions, migrations/0008) before any
    // field changes — every PATCH is now recoverable, not a silent overwrite.
    await snapshotBookVersion(c.env.DB, existing, authUser.sub);

    const mergedAttributes = body.attributes
      ? { ...JSON.parse(existing.attributes), ...body.attributes }
      : JSON.parse(existing.attributes);

    const pages = body.content ? toContentArray(body.content) : null;
    const totalPages = pages ? estimatePages(pages) : existing.total_pages;

    // Re-resolves author_id/illustrator_id whenever the corresponding name
    // changes, same find-or-create as createBookRecord() — otherwise a
    // renamed author would keep pointing at the old authors row.
    const authorId = body.author ? await findOrCreatePerson(c.env.DB, "authors", body.author) : existing.author_id;
    const illustratorId = body.illustrator
      ? await findOrCreatePerson(c.env.DB, "illustrators", body.illustrator)
      : existing.illustrator_id;

    try {
      await c.env.DB.prepare(
        `UPDATE books SET title = ?, author = ?, language = ?, level = ?, category = ?, age_group = ?, description = ?, is_educational = ?, attributes = ?, total_pages = ?, author_id = ?, illustrator_id = ?, updated_at = CURRENT_TIMESTAMP
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
          authorId,
          illustratorId,
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

// BookVersions (migrations/0008) — Administrator only, same gate as the
// write endpoints above (a version is an edit-history detail of an admin
// action, not reader-facing content).
books.get("/:id/versions", authMiddleware, requireRole(ROLES.ADMINISTRATOR), async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM book_versions WHERE book_id = ? ORDER BY version_number DESC"
  )
    .bind(id)
    .all<BookVersionRow>();
  return c.json({ versions: results.map(toApiBookVersion) });
});

books.get("/:id/versions/:versionNumber", authMiddleware, requireRole(ROLES.ADMINISTRATOR), async (c) => {
  const id = c.req.param("id");
  const versionNumber = Number(c.req.param("versionNumber"));
  const row = await c.env.DB.prepare("SELECT * FROM book_versions WHERE book_id = ? AND version_number = ?")
    .bind(id, versionNumber)
    .first<BookVersionRow>();
  if (!row) {
    return c.json({ error: "Version not found." }, 404);
  }
  return c.json({ version: toApiBookVersion(row) });
});

// Restores a book's fields/content to an earlier version — snapshots the
// current state first (via snapshotBookVersion), so restoring is itself
// just another recoverable edit, not a one-way door.
books.post(
  "/:id/versions/:versionNumber/restore",
  authMiddleware,
  requireRole(ROLES.ADMINISTRATOR),
  async (c) => {
    const id = c.req.param("id");
    const versionNumber = Number(c.req.param("versionNumber"));
    const authUser = c.get("authUser");

    const existing = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    if (!existing) {
      return c.json({ error: "Book not found." }, 404);
    }

    const version = await c.env.DB.prepare("SELECT * FROM book_versions WHERE book_id = ? AND version_number = ?")
      .bind(id, versionNumber)
      .first<BookVersionRow>();
    if (!version) {
      return c.json({ error: "Version not found." }, 404);
    }

    await snapshotBookVersion(c.env.DB, existing, authUser.sub);

    const restoredPages: string[] = JSON.parse(version.content);
    await c.env.DB.prepare(
      `UPDATE books SET title = ?, author = ?, language = ?, level = ?, category = ?, age_group = ?, description = ?, is_educational = ?, attributes = ?, total_pages = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        version.title,
        version.author,
        version.language,
        version.level,
        version.category,
        version.age_group,
        version.description,
        version.is_educational,
        version.attributes,
        estimatePages(restoredPages),
        id
      )
      .run();
    await replacePages(c.env.DB, id, restoredPages);

    const updatedRow = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
    const content = await getPageContent(c.env.DB, id);
    return c.json({ book: { ...toApiBook(updatedRow as BookRow), content } });
  }
);

books.delete("/:id", authMiddleware, requireRole(ROLES.ADMINISTRATOR), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await c.env.DB.prepare("SELECT id, title FROM books WHERE id = ?")
    .bind(id)
    .first<{ id: string; title: string }>();
  if (!existing) {
    return c.json({ error: "Book not found." }, 404);
  }

  // book_pages/reading_progress/bookmarks/page_bookmarks all cascade via
  // ON DELETE CASCADE (migrations/0001_initial_schema.sql).
  await c.env.DB.prepare("DELETE FROM books WHERE id = ?").bind(id).run();

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await writeAuditLog(c.env.DB, {
    actorId: authUser.sub,
    actorName,
    actorRole: authUser.role,
    action: "book_deleted",
    entityType: "book",
    entityId: id,
    metadata: { title: existing.title },
  });

  return c.json({ success: true });
});

export default books;
