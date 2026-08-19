import * as eventBus from '../../utils/eventBus';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const BOOKMARKS_KEY = 'zeroup_bookmarks';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Stage 9 (frontend integration): mirrors userService.js's realApiEnabled() —
// see that file for the full rationale. Reads stay synchronous against the
// localStorage cache regardless.
function realApiEnabled() {
  return isFeatureEnabled('realBookmarksApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${res.status}`);
  return res.json();
}

// Fire-and-forget mirror of a local write to the real API — no call site
// (BookDetailPage, ContinueJourneyCard, ReadingPage) needs to become async.
function mirrorToApi(method, path, body) {
  if (!realApiEnabled()) return;
  apiRequest(path, { method, body: body !== undefined ? JSON.stringify(body) : undefined }).catch((err) => {
    console.error(`Failed to mirror bookmark to the real API (${method} ${path}).`, err);
  });
}

// Hydrates the localStorage book-level bookmark list from the real API —
// called once per session (app boot if already signed in, or right after
// login/register, see AuthContext.js), same seam as
// userService.js's syncProgressFromApi()/booksService.js's
// syncBooksFromApi(). No-ops/never throws under the same conditions as those.
export async function syncBookmarksFromApi() {
  if (!realApiEnabled()) return;
  try {
    const { bookmarks } = await apiRequest('/bookmarks');
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Failed to sync bookmarks from the real API — keeping the cached copy.', err);
  }
}

export function getBookmarks() {
  const saved = localStorage.getItem(BOOKMARKS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function toggleBookmark(bookId) {
  const current = getBookmarks();
  const exists = current.includes(bookId);
  const updated = exists
    ? current.filter((id) => id !== bookId)
    : [...current, bookId];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  mirrorToApi('POST', `/bookmarks/${bookId}/toggle`);
  eventBus.emit('book.bookmarked', { bookId, bookmarked: !exists });
  return updated;
}

export function isBookmarked(bookId) {
  return getBookmarks().includes(bookId);
}

// Separate from the book-level "Save" above: this remembers one specific
// page per book — the Reading Page's bottom-toolbar Bookmark button — so a
// reader can drop a pin on "where I was" distinct from favouriting the whole
// title. Same localStorage-service pattern as the rest of this file rather
// than a new module, since it's the same "bookmark" domain concept.
const PAGE_BOOKMARKS_KEY = 'zeroup_page_bookmarks';

function readPageBookmarks() {
  const raw = localStorage.getItem(PAGE_BOOKMARKS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getPageBookmark(bookId) {
  const value = readPageBookmarks()[bookId];
  return typeof value === 'number' ? value : null;
}

// Refreshes one book's page pin from the real API and returns the resolved
// value — there's no bulk "list every page pin" endpoint (page pins are
// looked up per-book, unlike the book-level list above), so unlike
// syncBookmarksFromApi() this is called lazily, once per book opened, from
// useReadingPage.js's existing per-book effect rather than at session start.
export async function syncPageBookmarkFromApi(bookId) {
  if (!realApiEnabled()) return getPageBookmark(bookId);
  try {
    const { pageIndex } = await apiRequest(`/bookmarks/${bookId}/page`);
    const all = readPageBookmarks();
    if (typeof pageIndex === 'number') all[bookId] = pageIndex;
    else delete all[bookId];
    localStorage.setItem(PAGE_BOOKMARKS_KEY, JSON.stringify(all));
    return pageIndex;
  } catch (err) {
    console.error('Failed to sync page bookmark from the real API — keeping the cached copy.', err);
    return getPageBookmark(bookId);
  }
}

// Toggles: calling again with the same pageIndex clears the bookmark instead
// of re-setting it, so the bottom-toolbar button acts as an on/off pin.
export function setPageBookmark(bookId, pageIndex) {
  const all = readPageBookmarks();
  if (all[bookId] === pageIndex) {
    delete all[bookId];
  } else {
    all[bookId] = pageIndex;
  }
  localStorage.setItem(PAGE_BOOKMARKS_KEY, JSON.stringify(all));
  mirrorToApi('PUT', `/bookmarks/${bookId}/page`, { pageIndex });
  return all[bookId] ?? null;
}
