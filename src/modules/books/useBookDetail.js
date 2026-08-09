import { useState, useEffect, useMemo } from 'react';
import * as booksService from './booksService';
import * as eventBus from '../../utils/eventBus';
import { isBookmarked, toggleBookmark } from '../reading/bookmarksService';
import { READING_MINUTES_PER_PAGE, RELATED_BOOKS_COUNT, TAGLINE_MAX_LENGTH } from '../../config/rules';
import { BOOK_LANGUAGES } from '../../utils/mockData';

// Falls back to a short line lifted from `description` when a book has no
// bespoke `attributes.tagline`, so every book in the catalogue — not just the
// hand-authored demo titles — gets a hero tagline.
function deriveTagline(description) {
  if (!description) return '';
  const firstSentence = description.split(/(?<=[.!?])\s/)[0];
  const source = firstSentence.length >= 20 ? firstSentence : description;
  return source.length > TAGLINE_MAX_LENGTH
    ? `${source.slice(0, TAGLINE_MAX_LENGTH - 1).trimEnd()}…`
    : source;
}

// All of BookDetailPage's derived data (favourite state, estimated reading
// time, which languages this book is available in, related titles) lives
// here instead of the page's JSX, so the same page works for any bookId
// purely by what this hook returns (Separation of Concerns).
export default function useBookDetail(bookId) {
  const [books] = useState(() => booksService.getBooks());
  const book = useMemo(() => books.find((b) => b.id === bookId) || null, [books, bookId]);

  const [favourited, setFavourited] = useState(() => isBookmarked(bookId));
  useEffect(() => {
    if (book) setFavourited(isBookmarked(book.id));
  }, [book]);

  function toggleFavourite() {
    if (!book) return;
    const updated = toggleBookmark(book.id);
    setFavourited(updated.includes(book.id));
  }

  function downloadBook() {
    if (!book) return;
    const text = `${book.title}\nby ${book.author}\n\n${book.content.join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    eventBus.emit('book.downloaded', { id: book.id, title: book.title });
  }

  // Estimated reading time reuses the same words-per-page/reading-pace rule
  // the Reader Dashboard already estimates pace from, so the two numbers
  // shown to a reader for "how long will this take" never drift apart.
  const estimatedMinutes = book ? Math.max(1, Math.round(book.totalPages * READING_MINUTES_PER_PAGE)) : 0;

  const availableLanguages = book?.attributes?.availableLanguages?.length
    ? book.attributes.availableLanguages
    : book ? [book.language] : [];

  // Rest of the canonical language taxonomy this book isn't yet translated
  // into — drives the "+N more languages" link instead of a hardcoded count.
  const moreLanguagesCount = Math.max(0, BOOK_LANGUAGES.length - availableLanguages.length);

  const learningObjectives = book?.attributes?.learningObjectives || [];

  const tagline = book ? (book.attributes?.tagline || deriveTagline(book.description)) : '';

  const relatedBooks = useMemo(() => {
    if (!book) return [];
    const sortByRating = (a, b) => (b.rating || 0) - (a.rating || 0);
    const sameCategory = books.filter((b) => b.id !== book.id && b.category === book.category).sort(sortByRating);
    const rest = books.filter((b) => b.id !== book.id && b.category !== book.category).sort(sortByRating);
    return [...sameCategory, ...rest].slice(0, RELATED_BOOKS_COUNT);
  }, [book, books]);

  return {
    book,
    favourited,
    toggleFavourite,
    downloadBook,
    estimatedMinutes,
    availableLanguages,
    moreLanguagesCount,
    learningObjectives,
    relatedBooks,
    tagline,
  };
}
