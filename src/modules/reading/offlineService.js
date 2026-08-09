import * as eventBus from '../../utils/eventBus';

const OFFLINE_KEY = 'zeroup_offline_books';

function readAll() {
  const raw = localStorage.getItem(OFFLINE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeAll(entries) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(entries));
  return entries;
}

export function getDownloadedBooks() {
  return Object.values(readAll()).map((entry) => entry.book);
}

// Downloads page needs the metadata (when, how big) alongside each book —
// getDownloadedBooks() alone (just the book records) is enough for anywhere
// else a downloaded book is rendered as a plain BookCard.
export function getDownloadEntries() {
  return Object.values(readAll()).sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
}

export function isDownloaded(bookId) {
  return Boolean(readAll()[bookId]);
}

export function getOfflineBook(bookId) {
  return readAll()[bookId]?.book || null;
}

// A full copy of the book's own record (content included) is stored, not
// just an id, so the reader can open it with booksService unreachable —
// the whole point of "download for offline."
export function downloadBook(book) {
  const entries = readAll();
  const sizeBytes = JSON.stringify(book).length;
  entries[book.id] = { book, downloadedAt: new Date().toISOString(), sizeBytes };
  writeAll(entries);
  eventBus.emit('book.downloaded', { id: book.id, title: book.title, sizeBytes });
  return entries[book.id];
}

export function removeDownload(bookId) {
  const entries = readAll();
  delete entries[bookId];
  writeAll(entries);
  eventBus.emit('book.download.removed', { id: bookId });
}

export function getStorageUsedBytes() {
  return Object.values(readAll()).reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0);
}

export function getStorageUsedLabel() {
  const bytes = getStorageUsedBytes();
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
