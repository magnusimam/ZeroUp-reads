import * as eventBus from '../../utils/eventBus';
import * as booksService from '../books/booksService';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';
import { STATUS } from './publishingConfig';

const SUBMISSIONS_KEY = 'zeroup_submissions';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Stage 12 (frontend integration): routes the Publishing Studio to the real
// backend/ Publishing API (built in Stage 8) — same realApiEnabled() shape
// as every other service this session (flag + URL + a signed-in token,
// since /submissions is authenticated). Every write function below returns
// { success, submission, message? }, matching authService.js/
// booksService.js's admin-CRUD convention, rather than the old local-only
// functions' "return null on failure" shape.
function realApiEnabled() {
  return isFeatureEnabled('realPublishingApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${options.method || 'GET'} ${path} failed: ${res.status}`);
  return data;
}

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

export async function getSubmissions() {
  if (realApiEnabled()) {
    try {
      const { submissions } = await apiRequest('/submissions');
      return submissions;
    } catch (err) {
      console.error('Failed to fetch submissions from the real API — falling back to the local mock list.', err);
    }
  }
  return readAll();
}

export async function getSubmission(id) {
  if (realApiEnabled()) {
    try {
      const { submission } = await apiRequest(`/submissions/${id}`);
      return submission;
    } catch (err) {
      console.error('Failed to fetch the submission from the real API — falling back to the local mock copy.', err);
    }
  }
  return readAll().find((s) => s.id === id) || null;
}

export async function createDraft({ title, category, language, level, content }, author) {
  if (realApiEnabled()) {
    try {
      const { submission } = await apiRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify({ title, category, language, level, content }),
      });
      eventBus.emit('submission.created', { id: submission.id, title: submission.title });
      return { success: true, submission };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

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
  return { success: true, submission };
}

// Author-only edit, and only while the submission hasn't left their hands
// (draft or bounced back with needs_changes) — once it's submitted/in review/
// approved/published, editing here would silently invalidate what a
// reviewer already saw.
export async function updateDraft(id, fields) {
  if (realApiEnabled()) {
    try {
      const { submission } = await apiRequest(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
      return { success: true, submission };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission || ![STATUS.DRAFT, STATUS.NEEDS_CHANGES].includes(submission.status)) {
    return { success: false, message: 'This draft can no longer be edited.' };
  }

  const updated = { ...submission, ...fields, updatedAt: new Date().toISOString() };
  writeAll(submissions.map((s) => (s.id === id ? updated : s)));
  return { success: true, submission: updated };
}

async function runTransition(realPath, id, nextStatus, actor, comment) {
  if (realApiEnabled()) {
    try {
      const { submission } = await apiRequest(realPath, {
        method: 'POST',
        body: comment !== undefined ? JSON.stringify({ comment }) : undefined,
      });
      eventBus.emit('submission.status.changed', { id, status: nextStatus });
      return { success: true, submission };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

  const submission = applyTransition(id, nextStatus, actor, comment);
  if (!submission) return { success: false, message: 'Submission not found.' };
  return { success: true, submission };
}

export function submitForReview(id, actor) {
  return runTransition(`/submissions/${id}/submit`, id, STATUS.SUBMITTED, actor);
}

export function startReview(id, actor) {
  return runTransition(`/submissions/${id}/start-review`, id, STATUS.REVIEW, actor);
}

export function requestChanges(id, actor, comment) {
  return runTransition(`/submissions/${id}/request-changes`, id, STATUS.NEEDS_CHANGES, actor, comment);
}

export function approve(id, actor) {
  return runTransition(`/submissions/${id}/approve`, id, STATUS.APPROVED, actor);
}

// The only step that creates a real, live library book — nothing a reader
// can see exists until this runs, matching "nothing publishes until
// approved" from the reader-facing translation-request flow this pipeline
// extends the same philosophy to. The real API creates the book
// server-side (same createBookRecord() the admin Books API uses); the local
// mock mirrors that via booksService.createBook() as before.
export async function publish(id, actor) {
  if (realApiEnabled()) {
    try {
      const { submission, book } = await apiRequest(`/submissions/${id}/publish`, { method: 'POST' });
      // The book was created server-side — refresh the local catalogue cache
      // so it shows up in the Library immediately, not just after next boot.
      await booksService.syncBooksFromApi();
      eventBus.emit('submission.published', { id, bookId: book.id, title: book.title });
      return { success: true, submission };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

  const submission = readAll().find((s) => s.id === id) || null;
  if (!submission || submission.status !== STATUS.APPROVED) {
    return { success: false, message: 'This submission is not ready to publish.' };
  }

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
  return { success: true, submission: updated };
}

export async function addComment(id, actor, text) {
  if (!text?.trim()) return { success: false, message: 'Comment cannot be empty.' };

  if (realApiEnabled()) {
    try {
      const { submission } = await apiRequest(`/submissions/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });
      return { success: true, submission };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return { success: false, message: 'Submission not found.' };

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
  return { success: true, submission: updated };
}
