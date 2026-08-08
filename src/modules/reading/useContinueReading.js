import * as userService from '../../services/userService';

// Real "in progress" books for the current reader, merged from userService's
// persisted progress + the actual book records — one shared implementation
// so HomePage's banner and the Library page's "Continue Reading" section don't
// each grow their own copy of this same progress-to-book merge.
export default function useContinueReading(books) {
  const progress = userService.getProgress();
  return Object.entries(progress.inProgress || {})
    .map(([bookId, p]) => {
      const book = books.find((b) => b.id === bookId);
      return book ? { ...book, currentPage: p.currentPage, totalPages: p.totalPages } : null;
    })
    .filter(Boolean);
}
