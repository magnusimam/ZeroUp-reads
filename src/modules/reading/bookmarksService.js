import * as eventBus from '../../utils/eventBus';

const BOOKMARKS_KEY = 'zeroup_bookmarks';

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
  return all[bookId] ?? null;
}
