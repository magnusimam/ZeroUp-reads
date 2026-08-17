import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES, PUBLISHING_ROLES, REVIEWER_ROLES, PUBLISHER_ROLES } from "../config/roles";
import { toApiBook, getPageContent, createBookRecord, type BookRow } from "../books/service";

type SubmissionRow = {
  id: string;
  title: string;
  category: string;
  language: string;
  level: string;
  author_id: string;
  author_name: string;
  status: string;
  published_book_id: string | null;
  created_at: string;
  updated_at: string;
};

type HistoryRow = { status: string; by_user_id: string; by_name: string; comment: string | null; at: string };
type CommentRow = { id: number; by_user_id: string; by_name: string; by_role: string; text: string; at: string };

function toApiSubmission(row: SubmissionRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    language: row.language,
    level: row.level,
    authorId: row.author_id,
    authorName: row.author_name,
    status: row.status,
    publishedBookId: row.published_book_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toApiHistoryEntry(row: HistoryRow) {
  return { status: row.status, byUserId: row.by_user_id, byName: row.by_name, comment: row.comment, at: row.at };
}

function toApiComment(row: CommentRow) {
  return {
    id: String(row.id),
    byUserId: row.by_user_id,
    byName: row.by_name,
    byRole: row.by_role,
    text: row.text,
    at: row.at,
  };
}

async function getSubmissionRow(db: D1Database, id: string): Promise<SubmissionRow | null> {
  return db
    .prepare(
      `SELECT s.*, u.name as author_name FROM submissions s JOIN users u ON s.author_id = u.id WHERE s.id = ?`
    )
    .bind(id)
    .first<SubmissionRow>();
}

async function getSubmissionPages(db: D1Database, id: string): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT content FROM submission_pages WHERE submission_id = ? ORDER BY page_number ASC")
    .bind(id)
    .all<{ content: string }>();
  return results.map((row) => row.content);
}

async function replaceSubmissionPages(db: D1Database, id: string, pages: string[]): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM submission_pages WHERE submission_id = ?").bind(id),
    ...pages.map((content, index) =>
      db
        .prepare("INSERT INTO submission_pages (submission_id, page_number, content) VALUES (?, ?, ?)")
        .bind(id, index + 1, content)
    ),
  ]);
}

async function getHistory(db: D1Database, id: string) {
  const { results } = await db
    .prepare("SELECT * FROM submission_history WHERE submission_id = ? ORDER BY at ASC, id ASC")
    .bind(id)
    .all<HistoryRow>();
  return results.map(toApiHistoryEntry);
}

async function getComments(db: D1Database, id: string) {
  const { results } = await db
    .prepare("SELECT * FROM submission_comments WHERE submission_id = ? ORDER BY at ASC, id ASC")
    .bind(id)
    .all<CommentRow>();
  return results.map(toApiComment);
}

async function getActorName(db: D1Database, userId: string): Promise<string> {
  const row = await db.prepare("SELECT name FROM users WHERE id = ?").bind(userId).first<{ name: string }>();
  return row?.name ?? "Unknown";
}

async function pushHistory(
  db: D1Database,
  submissionId: string,
  status: string,
  byUserId: string,
  byName: string,
  comment?: string
): Promise<void> {
  await db.batch([
    db
      .prepare("UPDATE submissions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(status, submissionId),
    db
      .prepare("INSERT INTO submission_history (submission_id, status, by_user_id, by_name, comment) VALUES (?, ?, ?, ?, ?)")
      .bind(submissionId, status, byUserId, byName, comment ?? null),
  ]);
}

async function toApiDetail(db: D1Database, row: SubmissionRow) {
  const [content, history, comments] = await Promise.all([
    getSubmissionPages(db, row.id),
    getHistory(db, row.id),
    getComments(db, row.id),
  ]);
  return { ...toApiSubmission(row), content, history, comments };
}

const contentSchema = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);
function toContentArray(content: string | string[]): string[] {
  return Array.isArray(content) ? content : [content];
}

const createSchema = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  language: z.string().trim().min(1),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  content: contentSchema,
});

const updateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  content: contentSchema.optional(),
});

const commentSchema = z.object({ text: z.string().trim().min(1) });
const requestChangesSchema = z.object({ comment: z.string().trim().min(1) });

// True if `authUser` is the submission's author, or an administrator —
// mirrors SubmissionDetailPage.jsx's ownerOk check for author-only actions
// (submit/resubmit, editing a draft).
function isOwnerOrAdmin(authUser: { sub: string; role: string }, submission: SubmissionRow): boolean {
  return authUser.sub === submission.author_id || authUser.role === ROLES.ADMINISTRATOR;
}

const publishing = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

publishing.use("*", authMiddleware, requireRole(...PUBLISHING_ROLES));

publishing.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, u.name as author_name FROM submissions s JOIN users u ON s.author_id = u.id ORDER BY s.updated_at DESC`
  ).all<SubmissionRow>();
  return c.json({ submissions: results.map(toApiSubmission) });
});

publishing.get("/:id", async (c) => {
  const row = await getSubmissionRow(c.env.DB, c.req.param("id"));
  if (!row) return c.json({ error: "Submission not found." }, 404);
  return c.json({ submission: await toApiDetail(c.env.DB, row) });
});

publishing.post("/", zValidator("json", createSchema), async (c) => {
  const body = c.req.valid("json");
  const authUser = c.get("authUser");
  const id = crypto.randomUUID();
  const pages = toContentArray(body.content);
  const actorName = await getActorName(c.env.DB, authUser.sub);

  await c.env.DB.prepare(
    `INSERT INTO submissions (id, title, category, language, author_id, level, status) VALUES (?, ?, ?, ?, ?, ?, 'draft')`
  )
    .bind(id, body.title, body.category, body.language, authUser.sub, body.level)
    .run();
  await replaceSubmissionPages(c.env.DB, id, pages);
  await c.env.DB.prepare(
    "INSERT INTO submission_history (submission_id, status, by_user_id, by_name) VALUES (?, 'draft', ?, ?)"
  )
    .bind(id, authUser.sub, actorName)
    .run();

  const row = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, row as SubmissionRow) }, 201);
});

publishing.patch("/:id", zValidator("json", updateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const authUser = c.get("authUser");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);
  if (!isOwnerOrAdmin(authUser, existing)) return c.json({ error: "Forbidden." }, 403);
  if (!["draft", "needs_changes"].includes(existing.status)) {
    return c.json({ error: `Cannot edit a submission that is ${existing.status}.` }, 409);
  }

  await c.env.DB.prepare(
    `UPDATE submissions SET title = ?, category = ?, language = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(
      body.title ?? existing.title,
      body.category ?? existing.category,
      body.language ?? existing.language,
      body.level ?? existing.level,
      id
    )
    .run();

  if (body.content) {
    await replaceSubmissionPages(c.env.DB, id, toContentArray(body.content));
  }

  const updated = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) });
});

publishing.post("/:id/submit", requireRole(ROLES.AUTHOR, ROLES.TRANSLATOR, ROLES.ADMINISTRATOR), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);
  if (!isOwnerOrAdmin(authUser, existing)) return c.json({ error: "Forbidden." }, 403);
  if (!["draft", "needs_changes"].includes(existing.status)) {
    return c.json({ error: `Cannot submit a submission that is ${existing.status}.` }, 409);
  }

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await pushHistory(c.env.DB, id, "submitted", authUser.sub, actorName);

  const updated = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) });
});

publishing.post("/:id/start-review", requireRole(...REVIEWER_ROLES), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);
  if (existing.status !== "submitted") {
    return c.json({ error: `Cannot start review on a submission that is ${existing.status}.` }, 409);
  }

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await pushHistory(c.env.DB, id, "review", authUser.sub, actorName);

  const updated = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) });
});

publishing.post(
  "/:id/request-changes",
  requireRole(...REVIEWER_ROLES),
  zValidator("json", requestChangesSchema),
  async (c) => {
    const id = c.req.param("id");
    const authUser = c.get("authUser");
    const { comment } = c.req.valid("json");

    const existing = await getSubmissionRow(c.env.DB, id);
    if (!existing) return c.json({ error: "Submission not found." }, 404);
    if (existing.status !== "review") {
      return c.json({ error: `Cannot request changes on a submission that is ${existing.status}.` }, 409);
    }

    const actorName = await getActorName(c.env.DB, authUser.sub);
    await pushHistory(c.env.DB, id, "needs_changes", authUser.sub, actorName, comment);

    const updated = await getSubmissionRow(c.env.DB, id);
    return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) });
  }
);

publishing.post("/:id/approve", requireRole(...REVIEWER_ROLES), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);
  if (existing.status !== "review") {
    return c.json({ error: `Cannot approve a submission that is ${existing.status}.` }, 409);
  }

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await pushHistory(c.env.DB, id, "approved", authUser.sub, actorName);

  const updated = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) });
});

// The only step that creates a real, live library book — mirrors
// publishingService.js's publish(): nothing a reader can see exists until
// this runs.
publishing.post("/:id/publish", requireRole(...PUBLISHER_ROLES), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);
  if (existing.status !== "approved") {
    return c.json({ error: `Cannot publish a submission that is ${existing.status}.` }, 409);
  }

  const pages = await getSubmissionPages(c.env.DB, id);
  const bookId = await createBookRecord(c.env.DB, {
    title: existing.title,
    author: existing.author_name,
    language: existing.language,
    level: existing.level,
    category: existing.category,
    content: pages,
    attributes: { sourceSubmissionId: existing.id },
  });

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE submissions SET published_book_id = ? WHERE id = ?").bind(bookId, id),
  ]);
  await pushHistory(c.env.DB, id, "published", authUser.sub, actorName);

  const [updated, bookRow] = await Promise.all([
    getSubmissionRow(c.env.DB, id),
    c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(bookId).first<BookRow>(),
  ]);
  const bookContent = await getPageContent(c.env.DB, bookId);

  return c.json({
    submission: await toApiDetail(c.env.DB, updated as SubmissionRow),
    book: { ...toApiBook(bookRow as BookRow), content: bookContent },
  });
});

publishing.post("/:id/comments", zValidator("json", commentSchema), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const { text } = c.req.valid("json");

  const existing = await getSubmissionRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Submission not found." }, 404);

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await c.env.DB.prepare(
    "INSERT INTO submission_comments (submission_id, by_user_id, by_name, by_role, text) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, authUser.sub, actorName, authUser.role, text)
    .run();

  const updated = await getSubmissionRow(c.env.DB, id);
  return c.json({ submission: await toApiDetail(c.env.DB, updated as SubmissionRow) }, 201);
});

export default publishing;
