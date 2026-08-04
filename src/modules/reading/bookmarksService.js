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
