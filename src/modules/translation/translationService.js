import * as eventBus from '../../utils/eventBus';
import * as booksService from '../books/booksService';
import * as translationRequestService from '../books/translationRequestService';

const DRAFTS_KEY = 'zeroup_translation_drafts';

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

export function getDrafts() {
  return readAll();
}

export function getDraft(id) {
  return readAll().find((d) => d.id === id) || null;
}

// Resumes an existing draft for this book+language+translator (unless it was
// already approved and is therefore done) instead of always starting a blank
// one, so reopening the workspace doesn't discard earlier work.
export function startDraft(book, targetLanguage, translator) {
  const drafts = readAll();
  const existing = drafts.find((d) => (
    d.bookId === book.id && d.targetLanguage === targetLanguage &&
    d.translatorId === translator.id && d.status !== 'approved'
  ));
  if (existing) return existing;

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
  return draft;
}

// Caller (TranslationWorkspacePage) debounces the textarea's onChange before
// calling this — the service itself just persists whatever paragraphs it's
// given and stamps lastSavedAt.
export function autoSaveDraft(id, paragraphs) {
  const drafts = readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  const updated = { ...draft, paragraphs, lastSavedAt: new Date().toISOString() };
  writeAll(drafts.map((d) => (d.id === id ? updated : d)));
  eventBus.emit('translation.draft.saved', { id });
  return updated;
}

export function submitForReview(id, actor) {
  const drafts = readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  const updated = pushHistory(draft, 'submitted', actor);
  writeAll(drafts.map((d) => (d.id === id ? updated : d)));
  return updated;
}

export function reject(id, actor, comment) {
  const drafts = readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  const updated = pushHistory(draft, 'rejected', actor, comment);
  writeAll(drafts.map((d) => (d.id === id ? updated : d)));
  eventBus.emit('translation.request.rejected', { id, bookId: draft.bookId, language: draft.targetLanguage });
  return updated;
}

// Creates the real translated book (human-reviewed content, not the old
// instant-stub clone) and pushes the new language onto the original book's
// available-languages list, then reuses the existing
// 'translation.request.approved' event/shape (already tracked by logger.js)
// instead of inventing a parallel event name for the same concept.
export function approve(id, actor, comment) {
  const drafts = readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  const book = booksService.createBook({
    title: `${draft.bookTitle} (${draft.targetLanguage})`,
    author: booksService.getBook(draft.bookId)?.author || '',
    language: draft.targetLanguage,
    level: booksService.getBook(draft.bookId)?.level || 'Beginner',
    category: booksService.getBook(draft.bookId)?.category || '',
    content: draft.paragraphs.map((p) => p.translated),
    attributes: { translatedFrom: draft.bookId },
  });

  const original = booksService.getBook(draft.bookId);
  const existingLanguages = original?.attributes?.availableLanguages?.length
    ? original.attributes.availableLanguages
    : [original?.language].filter(Boolean);
  if (!existingLanguages.includes(draft.targetLanguage)) {
    booksService.updateBook(draft.bookId, {
      attributes: { availableLanguages: [...existingLanguages, draft.targetLanguage] },
    });
  }

  const updated = { ...pushHistory(draft, 'approved', actor, comment), translatedBookId: book.id };
  writeAll(drafts.map((d) => (d.id === id ? updated : d)));
  translationRequestService.resolvePendingRequest(draft.bookId, draft.targetLanguage, book.id);
  eventBus.emit('translation.request.approved', { id, bookId: draft.bookId, language: draft.targetLanguage });
  return updated;
}
