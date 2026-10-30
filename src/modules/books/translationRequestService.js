import * as eventBus from '../../utils/eventBus';
import * as booksService from './booksService';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

// A reader's "Translate" click doesn't translate anything by itself — it only
// queues a request here. An administrator accepts it (it then shows up in the
// Translation Workspace for translators) or declines it; it becomes
// `fulfilled` once a translator's draft for that book+language is approved
// (translationService.approve), per docs/ENGINEERING_BLUEPRINT.md §10's
// Original → Translation → Human Review → Approval → Publish pipeline.
// Accepting never publishes anything on its own.
//
// Stage 18: routes to the real backend/ Translations API
// (POST/GET /translations/requests) — same realApiEnabled() shape as
// publishingService.js, falling back to the localStorage mock below.
// Write functions return { success, request?, message? }.
const REQUESTS_KEY = 'zeroup_translation_requests';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const OPEN_STATUSES = ['pending', 'accepted'];

function realApiEnabled() {
  return isFeatureEnabled('realTranslationApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `${options.method || 'GET'} ${path} failed: ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

function readAll() {
  const raw = localStorage.getItem(REQUESTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return requests;
}

async function listByStatus(status) {
  if (realApiEnabled()) {
    try {
      const { requests } = await apiRequest(`/translations/requests?status=${status}`);
      return requests;
    } catch (err) {
      console.error('Failed to fetch translation requests from the real API — falling back to the local list.', err);
    }
  }
  return readAll().filter((r) => r.status === status);
}

// Admin CMS approval queue.
export function getPendingRequests() {
  return listByStatus('pending');
}

// Translation Workspace's "Open Requests" — accepted, waiting on a translator.
export function getOpenRequests() {
  return listByStatus('accepted');
}

// `duplicate: true` when this exact book+language already has an open
// request, so a reader mashing the button doesn't queue duplicates.
export async function requestTranslation(bookId, language, requestedBy) {
  const book = booksService.getBook(bookId);
  const title = book?.title || '';

  if (realApiEnabled()) {
    try {
      const { request } = await apiRequest('/translations/requests', {
        method: 'POST',
        body: JSON.stringify({ bookId, language }),
      });
      eventBus.emit('translation.requested', { id: request.id, bookId, title, language });
      return { success: true, request };
    } catch (err) {
      if (err.status === 409) return { success: false, duplicate: true };
      return { success: false, message: err.message || 'Could not reach the server. Please try again.' };
    }
  }

  if (!book) return { success: false, message: 'Book not found.' };
  const requests = readAll();
  const duplicate = requests.some(
    (r) => r.bookId === bookId && r.language === language && OPEN_STATUSES.includes(r.status)
  );
  if (duplicate) return { success: false, duplicate: true };

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
  eventBus.emit('translation.requested', { id: request.id, bookId, title, language });
  return { success: true, request };
}

async function transition(requestId, action, nextStatus, eventName) {
  if (realApiEnabled()) {
    try {
      const { request } = await apiRequest(`/translations/requests/${requestId}/${action}`, { method: 'POST' });
      eventBus.emit(eventName, { id: requestId, bookId: request.bookId, language: request.language });
      return { success: true, request };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please try again.' };
    }
  }

  const requests = readAll();
  const request = requests.find((r) => r.id === requestId);
  if (!request) return { success: false, message: 'Request not found.' };
  const updated = { ...request, status: nextStatus };
  writeAll(requests.map((r) => (r.id === requestId ? updated : r)));
  eventBus.emit(eventName, { id: requestId, bookId: request.bookId, language: request.language });
  return { success: true, request: updated };
}

export function acceptRequest(requestId) {
  return transition(requestId, 'accept', 'accepted', 'translation.request.accepted');
}

export function rejectRequest(requestId) {
  return transition(requestId, 'reject', 'rejected', 'translation.request.rejected');
}

// Local-mock counterpart of what POST /translations/drafts/:id/approve does
// server-side: marks any open request for this book+language fulfilled.
// Called by translationService.approve() only when the real API is off.
export function resolveOpenRequests(bookId, language, translatedBookId) {
  writeAll(readAll().map((r) => (
    r.bookId === bookId && r.language === language && OPEN_STATUSES.includes(r.status)
      ? { ...r, status: 'fulfilled', translatedBookId }
      : r
  )));
}
