import * as eventBus from '../../utils/eventBus';
import * as booksService from '../books/booksService';
import { STATUS } from './publishingConfig';

const SUBMISSIONS_KEY = 'zeroup_submissions';

function readAll() {
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(submissions) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return submissions;
}

function pushHistory(submission, status, actor, comment) {
  return {
    ...submission,
    status,
    updatedAt: new Date().toISOString(),
    history: [
      ...submission.history,
      { status, byUserId: actor.id, byName: actor.name, at: new Date().toISOString(), comment: comment || undefined },
    ],
  };
}

function applyTransition(id, nextStatus, actor, comment, extra = {}) {
  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return null;

  const updated = { ...pushHistory(submission, nextStatus, actor, comment), ...extra };
  writeAll(submissions.map((s) => (s.id === id ? updated : s)));
  eventBus.emit('submission.status.changed', { id, status: nextStatus });
  return updated;
}

export function getSubmissions() {
  return readAll();
}

export function getSubmission(id) {
  return readAll().find((s) => s.id === id) || null;
}

export function createDraft({ title, category, language, level, content }, author) {
  const submissions = readAll();
  const submission = {
    id: String(Date.now()),
    title,
    category,
    language,
    level,
    content: Array.isArray(content) ? content : [content],
    authorId: author.id,
    authorName: author.name,
    status: STATUS.DRAFT,
    history: [{ status: STATUS.DRAFT, byUserId: author.id, byName: author.name, at: new Date().toISOString() }],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeAll([submission, ...submissions]);
  eventBus.emit('submission.created', { id: submission.id, title: submission.title });
  return submission;
}

// Author-only edit, and only while the submission hasn't left their hands
// (draft or bounced back with needs_changes) — once it's submitted/in review/
// approved/published, editing here would silently invalidate what a
// reviewer already saw.
export function updateDraft(id, fields) {
  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission || ![STATUS.DRAFT, STATUS.NEEDS_CHANGES].includes(submission.status)) return null;

  const updated = { ...submission, ...fields, updatedAt: new Date().toISOString() };
  writeAll(submissions.map((s) => (s.id === id ? updated : s)));
  return updated;
}

export function submitForReview(id, actor) {
  return applyTransition(id, STATUS.SUBMITTED, actor);
}

export function startReview(id, actor) {
  return applyTransition(id, STATUS.REVIEW, actor);
}

export function requestChanges(id, actor, comment) {
  return applyTransition(id, STATUS.NEEDS_CHANGES, actor, comment);
}

export function approve(id, actor, comment) {
  return applyTransition(id, STATUS.APPROVED, actor, comment);
}

// The only step that creates a real, live library book — nothing a reader
// can see exists until this runs, matching "nothing publishes until
// approved" from the reader-facing translation-request flow this pipeline
// extends the same philosophy to.
export function publish(id, actor) {
  const submission = getSubmission(id);
  if (!submission || submission.status !== STATUS.APPROVED) return null;

  const book = booksService.createBook({
    title: submission.title,
    author: submission.authorName,
    language: submission.language,
    level: submission.level,
    category: submission.category,
    content: submission.content,
    attributes: { sourceSubmissionId: submission.id },
  });

  const updated = applyTransition(id, STATUS.PUBLISHED, actor, null, { publishedBookId: book.id });
  eventBus.emit('submission.published', { id, bookId: book.id, title: book.title });
  return updated;
}

export function addComment(id, actor, text) {
  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission || !text?.trim()) return null;

  const comment = {
    id: String(Date.now()),
    byUserId: actor.id,
    byName: actor.name,
    byRole: actor.systemRole,
    at: new Date().toISOString(),
    text: text.trim(),
  };
  const updated = { ...submission, comments: [...submission.comments, comment] };
  writeAll(submissions.map((s) => (s.id === id ? updated : s)));
  return updated;
}
