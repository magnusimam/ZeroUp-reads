import { MOCK_USER } from '../utils/mockData';
import * as eventBus from '../utils/eventBus';
import * as booksService from '../modules/books/booksService';

const PROGRESS_KEY = 'zeroup_reading_progress';

function readProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = {
    booksCompleted: MOCK_USER.booksCompleted,
    pagesRead: MOCK_USER.pagesRead,
    completedBookIds: MOCK_USER.completed.map((book) => book.id),
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(seed));
  return seed;
}

function writeProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function getProgress() {
  return readProgress();
}

// Persists real per-book page position so "Continue Reading" reflects what a
// reader actually opened, instead of the homepage fabricating two books as
// "in progress" for every logged-in user regardless of their real history.
export function recordProgress(bookId, currentPage, totalPages) {
  const progress = readProgress();
  if (progress.completedBookIds.includes(bookId)) return progress;

  return writeProgress({
    ...progress,
    inProgress: { ...(progress.inProgress || {}), [bookId]: { currentPage, totalPages } },
  });
}

// Real subscriber (Principle 5 — Event-Driven Architecture): finishing a book
// in ReadingPage now actually updates the reader's persisted progress instead
// of that logic living inline in the page, and instead of MOCK_USER staying
// a frozen snapshot forever.
eventBus.on('book.completed', ({ id }) => {
  const progress = readProgress();
  if (progress.completedBookIds.includes(id)) return;

  const book = booksService.getBook(id);
  const { [id]: _finished, ...stillInProgress } = progress.inProgress || {};
  writeProgress({
    ...progress,
    booksCompleted: progress.booksCompleted + 1,
    pagesRead: progress.pagesRead + (book?.totalPages || 0),
    completedBookIds: [...progress.completedBookIds, id],
    inProgress: stillInProgress,
  });
});
