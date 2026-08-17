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

// Registers a real user (submissions.author_id/submission_history.by_user_id
// etc. all FK-reference users(id), so tests need real rows, not just a
// fabricated JWT subject) and returns a token bearing whatever role the
// test wants to exercise — doesn't need to match the user's actual DB
// system_role, since authMiddleware trusts the JWT claim, matching how the
// rest of this API already works.
async function registerAndToken(role: Role) {
  userCounter += 1;
  const email = `pub-test-${userCounter}@example.com`;
  const res = await app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Test ${role}`, email, password: "correcthorse" }),
    },
    env
  );
  const { user } = await json(res);
  const token = await issueToken(user.id, role, env.JWT_SECRET);
  return { userId: user.id as string, header: { Authorization: `Bearer ${token}` } };
}

async function createDraft(authorHeader: Record<string, string>, overrides: Partial<Record<string, unknown>> = {}) {
  const res = await app.request(
    "/submissions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authorHeader },
      body: JSON.stringify({
        title: "Test Submission",
        category: "Storybooks",
        language: "English",
        level: "Beginner",
        content: ["Draft page one."],
        ...overrides,
      }),
    },
    env
  );
  const body = await json(res);
  return body.submission as { id: string; status: string };
}

describe("Role gating", () => {
  it("rejects a reader token on the whole /submissions router", async () => {
    const { header } = await registerAndToken(ROLES.READER);
    const res = await app.request("/submissions", { headers: header }, env);
    expect(res.status).toBe(403);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await app.request("/submissions", {}, env);
    expect(res.status).toBe(401);
  });
});

describe("POST /submissions (create draft)", () => {
  it("creates a draft owned by the requesting author, with an initial history entry", async () => {
    const { header, userId } = await registerAndToken(ROLES.AUTHOR);
    const res = await app.request(
      "/submissions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...header },
        body: JSON.stringify({
          title: "My Draft",
          category: "Storybooks",
          language: "English",
          level: "Beginner",
          content: ["Page one."],
        }),
      },
      env
    );
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.submission.status).toBe("draft");
    expect(body.submission.authorId).toBe(userId);
    expect(body.submission.content).toEqual(["Page one."]);
    expect(body.submission.history).toHaveLength(1);
    expect(body.submission.history[0].status).toBe("draft");
    expect(body.submission.comments).toEqual([]);
  });
});

describe("PATCH /submissions/:id", () => {
  it("lets the author edit their own draft", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const draft = await createDraft(author.header);

    const res = await app.request(
      `/submissions/${draft.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...author.header },
        body: JSON.stringify({ title: "Edited Title" }),
      },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.submission.title).toBe("Edited Title");
  });

  it("rejects another author editing someone else's draft", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const otherAuthor = await registerAndToken(ROLES.AUTHOR);
    const draft = await createDraft(author.header);

    const res = await app.request(
      `/submissions/${draft.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...otherAuthor.header },
        body: JSON.stringify({ title: "Hijacked" }),
      },
      env
    );
    expect(res.status).toBe(403);
  });

  it("rejects editing a submission that has moved past draft/needs_changes", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);

    const res = await app.request(
      `/submissions/${draft.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...author.header },
        body: JSON.stringify({ title: "Too late" }),
      },
      env
    );
    expect(res.status).toBe(409);
  });
});

describe("Full lifecycle: draft -> submitted -> review -> approved -> published", () => {
  it("walks the whole pipeline and creates a real book on publish", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const publisher = await registerAndToken(ROLES.PUBLISHER);

    const draft = await createDraft(author.header, { title: "Lifecycle Test Book" });
    expect(draft.status).toBe("draft");

    const submitRes = await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);
    expect(submitRes.status).toBe(200);
    expect((await json(submitRes)).submission.status).toBe("submitted");

    const reviewRes = await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: editor.header }, env);
    expect(reviewRes.status).toBe(200);
    expect((await json(reviewRes)).submission.status).toBe("review");

    const approveRes = await app.request(`/submissions/${draft.id}/approve`, { method: "POST", headers: editor.header }, env);
    expect(approveRes.status).toBe(200);
    expect((await json(approveRes)).submission.status).toBe("approved");

    const publishRes = await app.request(`/submissions/${draft.id}/publish`, { method: "POST", headers: publisher.header }, env);
    expect(publishRes.status).toBe(200);
    const publishBody = await json(publishRes);
    expect(publishBody.submission.status).toBe("published");
    expect(publishBody.submission.publishedBookId).toBeTruthy();
    expect(publishBody.book.title).toBe("Lifecycle Test Book");
    expect(publishBody.book.content).toEqual(["Draft page one."]);
    expect(publishBody.book.attributes).toEqual({ sourceSubmissionId: draft.id });

    // History should have one entry per transition, in order.
    const detailRes = await app.request(`/submissions/${draft.id}`, { headers: author.header }, env);
    const detail = await json(detailRes);
    expect(detail.submission.history.map((h: { status: string }) => h.status)).toEqual([
      "draft", "submitted", "review", "approved", "published",
    ]);

    // The published book is real and independently fetchable.
    const bookRes = await app.request(`/books/${publishBody.submission.publishedBookId}`, {}, env);
    expect(bookRes.status).toBe(200);
  });
});

describe("requestChanges path", () => {
  it("sends a submission back to needs_changes with a comment, then allows resubmission", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);

    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);
    await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: editor.header }, env);

    const res = await app.request(
      `/submissions/${draft.id}/request-changes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...editor.header },
        body: JSON.stringify({ comment: "Please fix the ending." }),
      },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.submission.status).toBe("needs_changes");
    const lastHistory = body.submission.history.at(-1);
    expect(lastHistory.comment).toBe("Please fix the ending.");

    const resubmitRes = await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);
    expect(resubmitRes.status).toBe(200);
    expect((await json(resubmitRes)).submission.status).toBe("submitted");
  });

  it("rejects request-changes without a comment", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);
    await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: editor.header }, env);

    const res = await app.request(
      `/submissions/${draft.id}/request-changes`,
      { method: "POST", headers: { "Content-Type": "application/json", ...editor.header }, body: JSON.stringify({}) },
      env
    );
    expect(res.status).toBe(400);
  });
});

describe("Status-conflict guards", () => {
  it("rejects starting review on a submission still in draft", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const draft = await createDraft(author.header);

    const res = await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: editor.header }, env);
    expect(res.status).toBe(409);
  });

  it("rejects approving a submission that's only submitted, not in review", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);

    const res = await app.request(`/submissions/${draft.id}/approve`, { method: "POST", headers: editor.header }, env);
    expect(res.status).toBe(409);
  });

  it("rejects publishing a submission that isn't approved", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const publisher = await registerAndToken(ROLES.PUBLISHER);
    const draft = await createDraft(author.header);

    const res = await app.request(`/submissions/${draft.id}/publish`, { method: "POST", headers: publisher.header }, env);
    expect(res.status).toBe(409);
  });
});

describe("Role gating on transitions", () => {
  it("rejects an author trying to start-review (reviewer-only action)", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);

    const res = await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: author.header }, env);
    expect(res.status).toBe(403);
  });

  it("rejects an editor trying to publish (publisher-only action)", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const draft = await createDraft(author.header);
    await app.request(`/submissions/${draft.id}/submit`, { method: "POST", headers: author.header }, env);
    await app.request(`/submissions/${draft.id}/start-review`, { method: "POST", headers: editor.header }, env);
    await app.request(`/submissions/${draft.id}/approve`, { method: "POST", headers: editor.header }, env);

    const res = await app.request(`/submissions/${draft.id}/publish`, { method: "POST", headers: editor.header }, env);
    expect(res.status).toBe(403);
  });
});

describe("Comments", () => {
  it("adds a comment visible on the submission detail, tagged with the actor's role", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    const editor = await registerAndToken(ROLES.EDITOR);
    const draft = await createDraft(author.header);

    const res = await app.request(
      `/submissions/${draft.id}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...editor.header },
        body: JSON.stringify({ text: "Looks great so far!" }),
      },
      env
    );
    expect(res.status).toBe(201);
    const body = await json(res);
    const comment = body.submission.comments.at(-1);
    expect(comment.text).toBe("Looks great so far!");
    expect(comment.byRole).toBe(ROLES.EDITOR);
  });
});

describe("GET /submissions (list)", () => {
  it("includes the author's real name via the join", async () => {
    const author = await registerAndToken(ROLES.AUTHOR);
    await createDraft(author.header, { title: "Listed Submission" });

    const res = await app.request("/submissions", { headers: author.header }, env);
    const body = await json(res);
    const listed = body.submissions.find((s: { title: string }) => s.title === "Listed Submission");
    expect(listed.authorName).toBe("Test author");
  });
});
