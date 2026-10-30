import * as eventBus from '../../utils/eventBus';
import * as booksService from '../books/booksService';
import * as translationRequestService from '../books/translationRequestService';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

// Translator drafts → human review → approval → a published translated book
// (docs/ENGINEERING_BLUEPRINT.md §10).
//
// Stage 18: routes to the real backend/ Translations API
// (/translations/drafts) so a translator's draft actually reaches a reviewer
// on another device — same realApiEnabled() shape as publishingService.js,
// falling back to the localStorage mock below. getDrafts/getDraft return
// data; every write returns { success, draft?, message? }.
const DRAFTS_KEY = 'zeroup_translation_drafts';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const EDITABLE_STATUSES = ['in_progress', 'rejected'];

function realApiEnabled() {
  return isFeatureEnabled('realTranslationApi') && Boolean(API_BASE_URL) && Boolean(getToken());
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

async function apiWrite(path, options) {
  try {
    return { success: true, ...(await apiRequest(path, options)) };
  } catch (err) {
    return { success: false, message: err.message || 'Could not reach the server. Please try again.' };
  }
}

function readAll() {
  const raw = localStorage.getItem(DRAFTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(drafts) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}

function pushHistory(draft, status, actor, comment) {
  return {
    ...draft,
    status,
    history: [
      ...draft.history,
      { status, byUserId: actor.id, byName: actor.name, at: new Date().toISOString(), comment: comment || undefined },
    ],
  };
}

function saveLocal(id, update) {
  const drafts = readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return { success: false, message: 'Draft not found.' };
  const result = update(draft);
  if (result.message) return { success: false, message: result.message };
  writeAll(drafts.map((d) => (d.id === id ? result : d)));
  return { success: true, draft: result };
}

export function countUntranslated(paragraphs) {
  return paragraphs.filter((p) => !p.translated.trim()).length;
}

// The API scopes this server-side (reviewers get every draft, a translator
// their own); the local mock returns everything and the hub filters.
export async function getDrafts() {
  if (realApiEnabled()) {
    try {
      const { drafts } = await apiRequest('/translations/drafts');
      return drafts;
    } catch (err) {
      console.error('Failed to fetch translation drafts from the real API — falling back to the local list.', err);
    }
  }
  return readAll();
}

// Resumes an existing open draft for this book+language+translator instead
// of always starting a blank one, so reopening the workspace doesn't discard
// earlier work.
export async function startDraft(book, targetLanguage, translator) {
  if (realApiEnabled()) {
    return apiWrite('/translations/drafts', {
      method: 'POST',
      body: JSON.stringify({ bookId: book.id, targetLanguage }),
    });
  }

  const drafts = readAll();
  const existing = drafts.find((d) => (
    d.bookId === book.id && d.targetLanguage === targetLanguage &&
    d.translatorId === translator.id && d.status !== 'approved'
  ));
  if (existing) return { success: true, draft: existing };

  const draft = {
    id: String(Date.now()),
    bookId: book.id,
    bookTitle: book.title,
    sourceLanguage: book.language,
    targetLanguage,
    paragraphs: book.content.map((original) => ({ original, translated: '' })),
    status: 'in_progress',
    translatorId: translator.id,
    translatorName: translator.name,
    history: [{ status: 'in_progress', byUserId: translator.id, byName: translator.name, at: new Date().toISOString() }],
    lastSavedAt: new Date().toISOString(),
  };

  writeAll([draft, ...drafts]);
  return { success: true, draft };
}

// Caller (useTranslationWorkspace) debounces typing before calling this —
// the service just persists whatever paragraphs it's given.
export async function autoSaveDraft(id, paragraphs) {
  const result = realApiEnabled()
    ? await apiWrite(`/translations/drafts/${id}/paragraphs`, {
      method: 'PUT',
      body: JSON.stringify({ paragraphs: paragraphs.map((p) => p.translated) }),
    })
    : saveLocal(id, (draft) => ({ ...draft, paragraphs, lastSavedAt: new Date().toISOString() }));
  if (result.success) eventBus.emit('translation.draft.saved', { id });
  return result;
}

// Every paragraph must be translated first — an approved draft becomes a
// live book page-for-page (the API enforces the same rule).
export async function submitForReview(id, actor) {
  if (realApiEnabled()) return apiWrite(`/translations/drafts/${id}/submit`, { method: 'POST' });

  return saveLocal(id, (draft) => {
    if (!EDITABLE_STATUSES.includes(draft.status)) return { message: `This draft is already ${draft.status}.` };
    const untranslated = countUntranslated(draft.paragraphs);
    if (untranslated > 0) return { message: `${untranslated} paragraph(s) still need a translation.` };
    return pushHistory(draft, 'submitted', actor);
  });
}

export async function reject(id, actor, comment) {
  const result = realApiEnabled()
    ? await apiWrite(`/translations/drafts/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) })
    : saveLocal(id, (draft) => pushHistory(draft, 'rejected', actor, comment));
  if (result.success) {
    eventBus.emit('translation.request.rejected', { id, bookId: result.draft.bookId, language: result.draft.targetLanguage });
  }
  return result;
}

// Creates the real translated book (human-reviewed content), adds the new
// language to the original book's availableLanguages, and fulfils any open
// reader request for it — server-side via the API, or locally in the mock.
// Reuses the existing 'translation.request.approved' event.
export async function approve(id, actor, comment) {
  if (realApiEnabled()) {
    const result = await apiWrite(`/translations/drafts/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(comment ? { comment } : {}),
    });
    if (result.success) {
      // Pulls in the new book and the original's updated availableLanguages.
      await booksService.syncBooksFromApi();
      eventBus.emit('translation.request.approved', { id, bookId: result.draft.bookId, language: result.draft.targetLanguage });
    }
    return result;
  }

  const draft = readAll().find((d) => d.id === id);
  if (!draft) return { success: false, message: 'Draft not found.' };

  const original = booksService.getBook(draft.bookId);
  const book = booksService.createBook({
    title: `${draft.bookTitle} (${draft.targetLanguage})`,
    author: original?.author || '',
    language: draft.targetLanguage,
    level: original?.level || 'Beginner',
    category: original?.category || '',
    content: draft.paragraphs.map((p) => p.translated),
    attributes: { translatedFrom: draft.bookId },
  });

  const existingLanguages = original?.attributes?.availableLanguages?.length
    ? original.attributes.availableLanguages
    : [original?.language].filter(Boolean);
  if (!existingLanguages.includes(draft.targetLanguage)) {
    booksService.updateBook(draft.bookId, {
      attributes: { availableLanguages: [...existingLanguages, draft.targetLanguage] },
    });
  }

  const result = saveLocal(id, (d) => ({ ...pushHistory(d, 'approved', actor, comment), translatedBookId: book.id }));
  translationRequestService.resolveOpenRequests(draft.bookId, draft.targetLanguage, book.id);
  eventBus.emit('translation.request.approved', { id, bookId: draft.bookId, language: draft.targetLanguage });
  return result;
}
