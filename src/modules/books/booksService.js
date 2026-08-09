import { MOCK_BOOKS } from '../../utils/mockData';
import * as eventBus from '../../utils/eventBus';
import { WORDS_PER_PAGE } from '../../config/rules';

const BOOKS_KEY = 'zeroup_books';

function readAll() {
  const raw = localStorage.getItem(BOOKS_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(MOCK_BOOKS));
  return MOCK_BOOKS;
}

function writeAll(books) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  return books;
}

export function getBooks() {
  return readAll();
}

export function getBook(id) {
  return readAll().find((book) => book.id === id) || null;
}

export function createBook({ title, author, language, level, category, content, attributes = {} }) {
  const books = readAll();
  const contentParagraphs = Array.isArray(content) ? content : [content];
  const wordCount = contentParagraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;

  const newBook = {
    id: String(Date.now()),
    title,
    author,
    language,
    level,
    category,
    totalPages: Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE)),
    content: contentParagraphs,
    attributes,
  };

  writeAll([newBook, ...books]);
  eventBus.emit('book.uploaded', { id: newBook.id, title: newBook.title });
  return newBook;
}

export function deleteBook(id) {
  const books = readAll().filter((book) => book.id !== id);
  writeAll(books);
  eventBus.emit('book.deleted', { id });
  return books;
}

// Generic partial update — `attributes` (if present in `patch`) is merged
// into the existing bag rather than replacing it outright, so one caller
// setting `availableLanguages` can't accidentally wipe another book
// attribute (theme, tagline, learningObjectives, ...) set separately.
export function updateBook(id, patch) {
  const books = readAll();
  const updated = books.map((book) => {
    if (book.id !== id) return book;
    const { attributes: attrPatch, ...rest } = patch;
    return {
      ...book,
      ...rest,
      attributes: attrPatch ? { ...book.attributes, ...attrPatch } : book.attributes,
    };
  });
  writeAll(updated);
  return updated.find((book) => book.id === id) || null;
}

export function translateBook(id, language) {
  const books = readAll();
  const original = books.find((book) => book.id === id);
  if (!original) return null;

  const translated = {
    ...original,
    id: String(Date.now()),
    language,
    title: `${original.title} (${language})`,
  };

  writeAll([...books, translated]);
  eventBus.emit('translation.completed', { originalId: id, newId: translated.id, language });
  return translated;
}
