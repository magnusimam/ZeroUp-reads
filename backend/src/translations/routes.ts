import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, hasPermission, requirePermission, type AuthVariables } from "../auth/middleware";
import { toApiBook, getPageContent, createBookRecord, snapshotBookVersion, type BookRow } from "../books/service";
import { createNotification } from "../notifications/service";
import { getActorName } from "../users/service";
import {
  findOpenDraftRow,
  getDraftRow,
  getParagraphs,
  getRequestRow,
  listDraftRows,
  listRequestRows,
  pushDraftHistory,
  toApiDraftDetail,
  toApiDraftSummary,
  toApiRequest,
  type DraftRow,
  type RequestRow,
} from "./service";

const REQUEST_STATUSES = ["pending", "accepted", "rejected", "fulfilled"] as const;
// A request still waiting on someone — a second identical one is a duplicate.
const OPEN_REQUEST_STATUSES = ["pending", "accepted"];
const EDITABLE_DRAFT_STATUSES = ["in_progress", "rejected"];

const createRequestSchema = z.object({
  bookId: z.string().trim().min(1),
  language: z.string().trim().min(1),
});

const listRequestsQuery = z.object({
  status: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.split(",").map((s) => s.trim()) : ["pending"]))
    .pipe(z.array(z.enum(REQUEST_STATUSES)).min(1)),
});

const startDraftSchema = z.object({
  bookId: z.string().trim().min(1),
  targetLanguage: z.string().trim().min(1),
});

// The translated text of every paragraph, in order — the originals are
// snapshotted server-side when the draft starts and never sent back.
const saveParagraphsSchema = z.object({ paragraphs: z.array(z.string()) });
const rejectSchema = z.object({ comment: z.string().trim().min(1) });
const approveSchema = z.object({ comment: z.string().trim().min(1).optional() });

async function getBookRow(db: D1Database, id: string): Promise<BookRow | null> {
  return db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookRow>();
}

async function languageExists(db: D1Database, code: string): Promise<boolean> {
  return Boolean(await db.prepare("SELECT 1 FROM languages WHERE code = ?").bind(code).first());
}

// Shared by both "pick a book + a target language" entry points.
async function validateBookAndLanguage(db: D1Database, bookId: string, language: string) {
  const book = await getBookRow(db, bookId);
  if (!book) return { error: "Book not found.", status: 404 as const };
  if (!(await languageExists(db, language))) return { error: `Unknown language "${language}".`, status: 400 as const };
  if (book.language === language) return { error: "That's already this book's language.", status: 400 as const };
  return { book };
}

// Drafts aren't public: only the translator who owns one, or a reviewer,
// can see it — anyone else gets 404, same "don't confirm the row exists"
// posture as Notifications.
async function canSeeDraft(db: D1Database, authUser: { sub: string; role: string }, draft: DraftRow) {
  return draft.translator_id === authUser.sub || hasPermission(db, authUser.role, "translations.review");
}

const translations = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

translations.use("*", authMiddleware);

// ── Reader requests ──────────────────────────────────────────────────────────

// Any signed-in reader can ask for a translation.
translations.post("/requests", zValidator("json", createRequestSchema), async (c) => {
  const { bookId, language } = c.req.valid("json");
  const authUser = c.get("authUser");

  const checked = await validateBookAndLanguage(c.env.DB, bookId, language);
  if ("error" in checked) return c.json({ error: checked.error }, checked.status);

  const duplicate = await c.env.DB.prepare(
    `SELECT 1 FROM translation_requests WHERE book_id = ? AND language = ? AND status IN (${OPEN_REQUEST_STATUSES.map(() => "?").join(", ")})`
  )
    .bind(bookId, language, ...OPEN_REQUEST_STATUSES)
    .first();
  if (duplicate) return c.json({ error: "A request for this book in that language is already open." }, 409);

  const id = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO translation_requests (id, book_id, language, requested_by) VALUES (?, ?, ?, ?)")
    .bind(id, bookId, language, authUser.sub)
    .run();

  const row = await getRequestRow(c.env.DB, id);
  return c.json({ request: toApiRequest(row as RequestRow) }, 201);
});

// `?status=pending` (default) is the admin approval queue; `?status=accepted`
// is the Translation Workspace's "Open Requests" list.
translations.get(
  "/requests",
  requirePermission("translations.access"),
  zValidator("query", listRequestsQuery),
  async (c) => {
    const { status } = c.req.valid("query");
    const rows = await listRequestRows(c.env.DB, status);
    return c.json({ requests: rows.map(toApiRequest) });
  }
);

// Accepting only hands the request to translators — nothing is published
// until a translator's draft for it is approved.
translations.post("/requests/:id/accept", requirePermission("translation_requests.manage"), async (c) => {
  const id = c.req.param("id");
  const existing = await getRequestRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Request not found." }, 404);
  if (existing.status !== "pending") {
    return c.json({ error: `Cannot accept a request that is ${existing.status}.` }, 409);
  }

  await c.env.DB.prepare("UPDATE translation_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();
  await createNotification(c.env.DB, {
    userId: existing.requested_by,
    type: "translation_request_accepted",
    title: "Translation request accepted",
    message: `Our translators will work on "${existing.book_title}" in ${existing.language}.`,
    entityType: "book",
    entityId: existing.book_id,
  });

  const row = await getRequestRow(c.env.DB, id);
  return c.json({ request: toApiRequest(row as RequestRow) });
});

translations.post("/requests/:id/reject", requirePermission("translation_requests.manage"), async (c) => {
  const id = c.req.param("id");
  const existing = await getRequestRow(c.env.DB, id);
  if (!existing) return c.json({ error: "Request not found." }, 404);
  if (!OPEN_REQUEST_STATUSES.includes(existing.status)) {
    return c.json({ error: `Cannot reject a request that is ${existing.status}.` }, 409);
  }

  await c.env.DB.prepare("UPDATE translation_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();
  await createNotification(c.env.DB, {
    userId: existing.requested_by,
    type: "translation_request_rejected",
    title: "Translation request declined",
    message: `We can't take on "${existing.book_title}" in ${existing.language} right now.`,
    entityType: "book",
    entityId: existing.book_id,
  });

  const row = await getRequestRow(c.env.DB, id);
  return c.json({ request: toApiRequest(row as RequestRow) });
});

// ── Translator drafts ────────────────────────────────────────────────────────

translations.use("/drafts/*", requirePermission("translations.access"));

// Reviewers see every draft (for the review queue); a translator sees their own.
translations.get("/drafts", async (c) => {
  const authUser = c.get("authUser");
  const isReviewer = await hasPermission(c.env.DB, authUser.role, "translations.review");
  const rows = await listDraftRows(c.env.DB, isReviewer ? null : authUser.sub);
  return c.json({ drafts: rows.map(toApiDraftSummary) });
});

// Starts a draft, or resumes the caller's open one for the same
// book+language (200 vs 201), so reopening the workspace never loses work.
translations.post("/drafts", zValidator("json", startDraftSchema), async (c) => {
  const { bookId, targetLanguage } = c.req.valid("json");
  const authUser = c.get("authUser");

  const checked = await validateBookAndLanguage(c.env.DB, bookId, targetLanguage);
  if ("error" in checked) return c.json({ error: checked.error }, checked.status);

  const existing = await findOpenDraftRow(c.env.DB, bookId, targetLanguage, authUser.sub);
  if (existing) return c.json({ draft: await toApiDraftDetail(c.env.DB, existing) });

  const id = crypto.randomUUID();
  const pages = await getPageContent(c.env.DB, bookId);
  const actorName = await getActorName(c.env.DB, authUser.sub);

  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO translation_drafts (id, book_id, source_language, target_language, translator_id) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, bookId, checked.book.language, targetLanguage, authUser.sub),
    ...pages.map((original, index) =>
      c.env.DB.prepare("INSERT INTO translation_draft_paragraphs (draft_id, paragraph_index, original) VALUES (?, ?, ?)").bind(
        id,
        index,
        original
      )
    ),
    c.env.DB.prepare(
      "INSERT INTO translation_draft_history (draft_id, status, by_user_id, by_name) VALUES (?, 'in_progress', ?, ?)"
    ).bind(id, authUser.sub, actorName),
  ]);

  const row = await getDraftRow(c.env.DB, id);
  return c.json({ draft: await toApiDraftDetail(c.env.DB, row as DraftRow) }, 201);
});

translations.get("/drafts/:id", async (c) => {
  const row = await getDraftRow(c.env.DB, c.req.param("id"));
  if (!row || !(await canSeeDraft(c.env.DB, c.get("authUser"), row))) {
    return c.json({ error: "Draft not found." }, 404);
  }
  return c.json({ draft: await toApiDraftDetail(c.env.DB, row) });
});

// Autosave target — owner only, and only while the draft is in their hands.
translations.put("/drafts/:id/paragraphs", zValidator("json", saveParagraphsSchema), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const { paragraphs } = c.req.valid("json");

  const row = await getDraftRow(c.env.DB, id);
  if (!row || !(await canSeeDraft(c.env.DB, authUser, row))) return c.json({ error: "Draft not found." }, 404);
  if (row.translator_id !== authUser.sub) return c.json({ error: "Only the translator can edit this draft." }, 403);
  if (!EDITABLE_DRAFT_STATUSES.includes(row.status)) {
    return c.json({ error: `Cannot edit a draft that is ${row.status}.` }, 409);
  }

  const current = await getParagraphs(c.env.DB, id);
  if (paragraphs.length !== current.length) {
    return c.json({ error: `Expected ${current.length} paragraphs, got ${paragraphs.length}.` }, 400);
  }

  await c.env.DB.batch([
    ...paragraphs.map((translated, index) =>
      c.env.DB.prepare(
        "UPDATE translation_draft_paragraphs SET translated = ? WHERE draft_id = ? AND paragraph_index = ?"
      ).bind(translated, id, index)
    ),
    c.env.DB.prepare(
      "UPDATE translation_drafts SET last_saved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(id),
  ]);

  const updated = await getDraftRow(c.env.DB, id);
  return c.json({ draft: await toApiDraftDetail(c.env.DB, updated as DraftRow) });
});

translations.post("/drafts/:id/submit", async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const row = await getDraftRow(c.env.DB, id);
  if (!row || !(await canSeeDraft(c.env.DB, authUser, row))) return c.json({ error: "Draft not found." }, 404);
  if (row.translator_id !== authUser.sub) return c.json({ error: "Only the translator can submit this draft." }, 403);
  if (!EDITABLE_DRAFT_STATUSES.includes(row.status)) {
    return c.json({ error: `Cannot submit a draft that is ${row.status}.` }, 409);
  }

  // An approved draft becomes a live book page-for-page, so a blank
  // paragraph here would publish a blank page.
  const paragraphs = await getParagraphs(c.env.DB, id);
  const untranslated = paragraphs.filter((p) => !p.translated.trim()).length;
  if (untranslated > 0) {
    return c.json({ error: `${untranslated} paragraph(s) still need a translation.` }, 409);
  }

  const actorName = await getActorName(c.env.DB, authUser.sub);
  await pushDraftHistory(c.env.DB, id, "submitted", authUser.sub, actorName);

  const updated = await getDraftRow(c.env.DB, id);
  return c.json({ draft: await toApiDraftDetail(c.env.DB, updated as DraftRow) });
});

translations.post(
  "/drafts/:id/reject",
  requirePermission("translations.review"),
  zValidator("json", rejectSchema),
  async (c) => {
    const id = c.req.param("id");
    const authUser = c.get("authUser");
    const { comment } = c.req.valid("json");

    const row = await getDraftRow(c.env.DB, id);
    if (!row) return c.json({ error: "Draft not found." }, 404);
    if (row.translator_id === authUser.sub) return c.json({ error: "You can't review your own translation." }, 403);
    if (row.status !== "submitted") {
      return c.json({ error: `Cannot reject a draft that is ${row.status}.` }, 409);
    }

    const actorName = await getActorName(c.env.DB, authUser.sub);
    await pushDraftHistory(c.env.DB, id, "rejected", authUser.sub, actorName, comment);
    await createNotification(c.env.DB, {
      userId: row.translator_id,
      type: "translation_needs_revision",
      title: "Translation needs revision",
      message: `${actorName} sent back "${row.book_title}" (${row.target_language}): ${comment}`,
      entityType: "translation_draft",
      entityId: id,
    });

    const updated = await getDraftRow(c.env.DB, id);
    return c.json({ draft: await toApiDraftDetail(c.env.DB, updated as DraftRow) });
  }
);

// The only step that creates a live translated book — mirrors
// translationService.js's approve(): new book + the original's
// availableLanguages updated + any matching reader request fulfilled.
translations.post(
  "/drafts/:id/approve",
  requirePermission("translations.review"),
  zValidator("json", approveSchema),
  async (c) => {
    const id = c.req.param("id");
    const authUser = c.get("authUser");
    const { comment } = c.req.valid("json");

    const row = await getDraftRow(c.env.DB, id);
    if (!row) return c.json({ error: "Draft not found." }, 404);
    if (row.translator_id === authUser.sub) return c.json({ error: "You can't review your own translation." }, 403);
    if (row.status !== "submitted") {
      return c.json({ error: `Cannot approve a draft that is ${row.status}.` }, 409);
    }

    const original = await getBookRow(c.env.DB, row.book_id);
    if (!original) return c.json({ error: "The original book no longer exists." }, 409);

    const paragraphs = await getParagraphs(c.env.DB, id);
    const bookId = await createBookRecord(c.env.DB, {
      title: `${original.title} (${row.target_language})`,
      author: original.author,
      language: row.target_language,
      level: original.level,
      category: original.category,
      ageGroup: original.age_group ?? undefined,
      description: original.description ?? undefined,
      isEducational: Boolean(original.is_educational),
      content: paragraphs.map((p) => p.translated),
      attributes: { translatedFrom: original.id, sourceTranslationDraftId: id },
    });

    // Same snapshot-before-edit rule as PATCH /books/:id, so this change to
    // the original book shows up in its version history.
    const attributes = JSON.parse(original.attributes) as { availableLanguages?: string[] };
    const languages = attributes.availableLanguages?.length ? attributes.availableLanguages : [original.language];
    if (!languages.includes(row.target_language)) {
      await snapshotBookVersion(c.env.DB, original, authUser.sub);
      await c.env.DB.prepare("UPDATE books SET attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(JSON.stringify({ ...attributes, availableLanguages: [...languages, row.target_language] }), original.id)
        .run();
    }

    const { results: fulfilledRequests } = await c.env.DB.prepare(
      `SELECT requested_by FROM translation_requests WHERE book_id = ? AND language = ? AND status IN (${OPEN_REQUEST_STATUSES.map(() => "?").join(", ")})`
    )
      .bind(row.book_id, row.target_language, ...OPEN_REQUEST_STATUSES)
      .all<{ requested_by: string }>();

    const actorName = await getActorName(c.env.DB, authUser.sub);
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE translation_drafts SET translated_book_id = ? WHERE id = ?").bind(bookId, id),
      c.env.DB.prepare(
        `UPDATE translation_requests SET status = 'fulfilled', translated_book_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE book_id = ? AND language = ? AND status IN (${OPEN_REQUEST_STATUSES.map(() => "?").join(", ")})`
      ).bind(bookId, row.book_id, row.target_language, ...OPEN_REQUEST_STATUSES),
    ]);
    await pushDraftHistory(c.env.DB, id, "approved", authUser.sub, actorName, comment);

    await createNotification(c.env.DB, {
      userId: row.translator_id,
      type: "translation_approved",
      title: "Translation approved!",
      message: `"${row.book_title}" in ${row.target_language} is now live in the library.`,
      entityType: "book",
      entityId: bookId,
    });
    const requesters = [...new Set(fulfilledRequests.map((r) => r.requested_by))];
    for (const userId of requesters) {
      await createNotification(c.env.DB, {
        userId,
        type: "translation_request_fulfilled",
        title: "Your translation is ready",
        message: `"${row.book_title}" is now available in ${row.target_language}.`,
        entityType: "book",
        entityId: bookId,
      });
    }

    const [updated, bookRow] = await Promise.all([getDraftRow(c.env.DB, id), getBookRow(c.env.DB, bookId)]);
    const bookContent = await getPageContent(c.env.DB, bookId);
    return c.json({
      draft: await toApiDraftDetail(c.env.DB, updated as DraftRow),
      book: { ...toApiBook(bookRow as BookRow), content: bookContent },
    });
  }
);

export default translations;
