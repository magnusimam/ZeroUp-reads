import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import { issueToken } from "../auth/jwt";
import { ROLES, type Role } from "../config/roles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

let userCounter = 0;

// Same approach as publishing/routes.test.ts: a real user row (requests and
// drafts FK-reference users(id)) plus a JWT carrying whichever role the test
// exercises.
async function registerAndToken(role: Role) {
  userCounter += 1;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Test ${role} ${userCounter}`, email: `tr-test-${userCounter}@example.com`, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { userId: user.id as string, header: { Authorization: `Bearer ${token}` } };
}

function call(path: string, header: Record<string, string>, method = "GET", body?: unknown) {
  return app.request(
    path,
    {
      method,
      headers: { "Content-Type": "application/json", ...header },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env
  );
}

// Seed book '1' ("Anansi the Spider") is English with several pages.
const BOOK_ID = "1";

describe("Translation requests", () => {
  it("requires sign-in to request a translation", async () => {
    const res = await app.request(
      "/translations/requests",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookId: BOOK_ID, language: "Swahili" }) },
      env
    );
    expect(res.status).toBe(401);
  });

  it("lets a reader request one, and rejects duplicates, the book's own language and unknown books", async () => {
    const reader = await registerAndToken(ROLES.READER);

    const created = await call("/translations/requests", reader.header, "POST", { bookId: BOOK_ID, language: "Swahili" });
    expect(created.status).toBe(201);
    const { request } = await json(created);
    expect(request).toMatchObject({ bookId: BOOK_ID, bookTitle: "Anansi the Spider", language: "Swahili", status: "pending", requestedBy: reader.userId });

    const duplicate = await call("/translations/requests", reader.header, "POST", { bookId: BOOK_ID, language: "Swahili" });
    expect(duplicate.status).toBe(409);

    const sameLanguage = await call("/translations/requests", reader.header, "POST", { bookId: BOOK_ID, language: "English" });
    expect(sameLanguage.status).toBe(400);

    const missingBook = await call("/translations/requests", reader.header, "POST", { bookId: "no-such-book", language: "Zulu" });
    expect(missingBook.status).toBe(404);
  });

  it("only lets workspace roles list requests, and only an administrator accept/reject them", async () => {
    const reader = await registerAndToken(ROLES.READER);
    const translator = await registerAndToken(ROLES.TRANSLATOR);
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);

    const { request } = await json(await call("/translations/requests", reader.header, "POST", { bookId: BOOK_ID, language: "Yoruba" }));

    expect((await call("/translations/requests", reader.header)).status).toBe(403);
    expect((await call(`/translations/requests/${request.id}/accept`, translator.header, "POST")).status).toBe(403);

    const pending = await json(await call("/translations/requests?status=pending", admin.header));
    expect(pending.requests.map((r: { id: string }) => r.id)).toContain(request.id);

    const accepted = await call(`/translations/requests/${request.id}/accept`, admin.header, "POST");
    expect(accepted.status).toBe(200);
    expect((await json(accepted)).request.status).toBe("accepted");
    expect((await call(`/translations/requests/${request.id}/accept`, admin.header, "POST")).status).toBe(409);

    const open = await json(await call("/translations/requests?status=accepted", translator.header));
    expect(open.requests.map((r: { id: string }) => r.id)).toContain(request.id);

    const notifications = await json(await call("/notifications", reader.header));
    expect(notifications.notifications.some((n: { type: string }) => n.type === "translation_request_accepted")).toBe(true);
  });

  it("rejects an unknown status filter", async () => {
    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    expect((await call("/translations/requests?status=bogus", admin.header)).status).toBe(400);
  });
});

describe("Translation drafts", () => {
  it("is closed to readers", async () => {
    const reader = await registerAndToken(ROLES.READER);
    expect((await call("/translations/drafts", reader.header)).status).toBe(403);
    expect((await call("/translations/drafts", reader.header, "POST", { bookId: BOOK_ID, targetLanguage: "Zulu" })).status).toBe(403);
  });

  it("starts a draft from the book's pages and resumes it on a second start", async () => {
    const translator = await registerAndToken(ROLES.TRANSLATOR);

    const started = await call("/translations/drafts", translator.header, "POST", { bookId: BOOK_ID, targetLanguage: "Zulu" });
    expect(started.status).toBe(201);
    const { draft } = await json(started);
    expect(draft).toMatchObject({ bookId: BOOK_ID, sourceLanguage: "English", targetLanguage: "Zulu", status: "in_progress", translatorId: translator.userId });
    expect(draft.paragraphs.length).toBeGreaterThan(0);
    expect(draft.paragraphs[0]).toEqual({ original: expect.any(String), translated: "" });
    expect(draft.history).toHaveLength(1);

    const resumed = await call("/translations/drafts", translator.header, "POST", { bookId: BOOK_ID, targetLanguage: "Zulu" });
    expect(resumed.status).toBe(200);
    expect((await json(resumed)).draft.id).toBe(draft.id);
  });

  it("hides a draft from other translators but shows it to reviewers", async () => {
    const owner = await registerAndToken(ROLES.TRANSLATOR);
    const other = await registerAndToken(ROLES.TRANSLATOR);
    const editor = await registerAndToken(ROLES.EDITOR);

    const { draft } = await json(await call("/translations/drafts", owner.header, "POST", { bookId: BOOK_ID, targetLanguage: "Hausa" }));

    expect((await call(`/translations/drafts/${draft.id}`, other.header)).status).toBe(404);
    expect((await call(`/translations/drafts/${draft.id}`, editor.header)).status).toBe(200);

    const otherList = await json(await call("/translations/drafts", other.header));
    expect(otherList.drafts.map((d: { id: string }) => d.id)).not.toContain(draft.id);
    const editorList = await json(await call("/translations/drafts", editor.header));
    expect(editorList.drafts.map((d: { id: string }) => d.id)).toContain(draft.id);
  });

  it("runs the full save → submit → reject → resubmit → approve lifecycle", async () => {
    const reader = await registerAndToken(ROLES.READER);
    const translator = await registerAndToken(ROLES.TRANSLATOR);
    const editor = await registerAndToken(ROLES.EDITOR);

    const { request } = await json(await call("/translations/requests", reader.header, "POST", { bookId: BOOK_ID, language: "Igbo" }));
    const { draft } = await json(await call("/translations/drafts", translator.header, "POST", { bookId: BOOK_ID, targetLanguage: "Igbo" }));
    const count = draft.paragraphs.length;

    // Wrong paragraph count, and edits by anyone but the translator, are refused.
    expect((await call(`/translations/drafts/${draft.id}/paragraphs`, translator.header, "PUT", { paragraphs: ["only one"] })).status).toBe(count === 1 ? 200 : 400);
    expect((await call(`/translations/drafts/${draft.id}/paragraphs`, editor.header, "PUT", { paragraphs: Array(count).fill("x") })).status).toBe(403);

    // Partially translated → can't submit yet.
    const partial = Array.from({ length: count }, (_, i) => (i === 0 ? "Igbo page 1" : ""));
    expect((await call(`/translations/drafts/${draft.id}/paragraphs`, translator.header, "PUT", { paragraphs: partial })).status).toBe(200);
    if (count > 1) {
      expect((await call(`/translations/drafts/${draft.id}/submit`, translator.header, "POST")).status).toBe(409);
    }

    const full = Array.from({ length: count }, (_, i) => `Igbo page ${i + 1}`);
    const saved = await json(await call(`/translations/drafts/${draft.id}/paragraphs`, translator.header, "PUT", { paragraphs: full }));
    expect(saved.draft.paragraphs.map((p: { translated: string }) => p.translated)).toEqual(full);

    expect((await call(`/translations/drafts/${draft.id}/submit`, translator.header, "POST")).status).toBe(200);
    // Locked while under review.
    expect((await call(`/translations/drafts/${draft.id}/paragraphs`, translator.header, "PUT", { paragraphs: full })).status).toBe(409);

    // A translator can't review at all; a reviewer must give a reason to send back.
    expect((await call(`/translations/drafts/${draft.id}/approve`, translator.header, "POST", {})).status).toBe(403);
    expect((await call(`/translations/drafts/${draft.id}/reject`, editor.header, "POST", { comment: "" })).status).toBe(400);

    const rejected = await json(await call(`/translations/drafts/${draft.id}/reject`, editor.header, "POST", { comment: "Fix page 1" }));
    expect(rejected.draft.status).toBe("rejected");
    expect(rejected.draft.history.at(-1)).toMatchObject({ status: "rejected", comment: "Fix page 1" });

    expect((await call(`/translations/drafts/${draft.id}/submit`, translator.header, "POST")).status).toBe(200);

    const approvedRes = await call(`/translations/drafts/${draft.id}/approve`, editor.header, "POST", {});
    expect(approvedRes.status).toBe(200);
    const approved = await json(approvedRes);
    expect(approved.draft.status).toBe("approved");
    expect(approved.draft.translatedBookId).toBe(approved.book.id);
    expect(approved.book).toMatchObject({ title: "Anansi the Spider (Igbo)", language: "Igbo", content: full });
    expect(approved.book.attributes.translatedFrom).toBe(BOOK_ID);

    const original = await json(await app.request(`/books/${BOOK_ID}`, {}, env));
    expect(original.book.attributes.availableLanguages).toEqual(expect.arrayContaining(["English", "Igbo"]));

    const admin = await registerAndToken(ROLES.ADMINISTRATOR);
    const fulfilled = await json(await call("/translations/requests?status=fulfilled", admin.header));
    expect(fulfilled.requests.find((r: { id: string }) => r.id === request.id)).toMatchObject({ translatedBookId: approved.book.id });

    // Approved drafts aren't resumed — starting again opens a fresh one.
    const restarted = await call("/translations/drafts", translator.header, "POST", { bookId: BOOK_ID, targetLanguage: "Igbo" });
    expect(restarted.status).toBe(201);
  });

  it("stops a reviewer approving their own translation", async () => {
    const editor = await registerAndToken(ROLES.EDITOR);
    const { draft } = await json(await call("/translations/drafts", editor.header, "POST", { bookId: BOOK_ID, targetLanguage: "Pidgin" }));
    const full = draft.paragraphs.map((_: unknown, i: number) => `Pidgin ${i}`);
    await call(`/translations/drafts/${draft.id}/paragraphs`, editor.header, "PUT", { paragraphs: full });
    await call(`/translations/drafts/${draft.id}/submit`, editor.header, "POST");

    expect((await call(`/translations/drafts/${draft.id}/approve`, editor.header, "POST", {})).status).toBe(403);
  });
});
