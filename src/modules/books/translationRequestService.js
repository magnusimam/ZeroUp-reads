import * as eventBus from '../../utils/eventBus';
import * as booksService from './booksService';

// A reader-facing "Translate" click doesn't translate anything by itself —
// it only queues a request here. The actual translation (booksService.translateBook,
// same stub AdminCMSPage's own instant Translate modal already uses) only runs once
// an admin approves the request, per docs/ENGINEERING_BLUEPRINT.md §10's
// Original → AI Translation → Human Review → Approval → Publish pipeline.
const REQUESTS_KEY = 'zeroup_translation_requests';

function readAll() {
  const raw = localStorage.getItem(REQUESTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return requests;
}

export function getRequests() {
  return readAll();
}

export function getPendingRequests() {
  return readAll().filter((r) => r.status === 'pending');
}

// Returns null if this exact book+language already has a pending request,
// so a reader mashing the button doesn't queue duplicates for the admin.
export function requestTranslation(bookId, language, requestedBy) {
  const book = booksService.getBook(bookId);
  if (!book) return null;

  const requests = readAll();
  const duplicate = requests.some(
    (r) => r.bookId === bookId && r.language === language && r.status === 'pending'
  );
  if (duplicate) return null;

  const request = {
    id: String(Date.now()),
    bookId,
    bookTitle: book.title,
    language,
    status: 'pending',
    requestedBy: requestedBy || null,
    requestedAt: new Date().toISOString(),
  };

  writeAll([request, ...requests]);
  eventBus.emit('translation.requested', { id: request.id, bookId, title: book.title, language });
  return request;
}

export function approveRequest(requestId) {
  const requests = readAll();
  const request = requests.find((r) => r.id === requestId);
  if (!request || request.status !== 'pending') return null;

  const translated = booksService.translateBook(request.bookId, request.language);

  writeAll(requests.map((r) => (
    r.id === requestId ? { ...r, status: 'approved', translatedBookId: translated?.id || null } : r
  )));
  eventBus.emit('translation.request.approved', { id: requestId, bookId: request.bookId, language: request.language });
  return translated;
}

export function rejectRequest(requestId) {
  const requests = readAll();
  const updated = writeAll(requests.map((r) => (
    r.id === requestId ? { ...r, status: 'rejected' } : r
  )));
  eventBus.emit('translation.request.rejected', { id: requestId });
  return updated.find((r) => r.id === requestId) || null;
}
