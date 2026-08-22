import { MOCK_BOOKS } from '../../utils/mockData';
import * as eventBus from '../../utils/eventBus';
import { getToken } from '../auth/authService';
import { WORDS_PER_PAGE } from '../../config/rules';
import { isFeatureEnabled } from '../../config/featureFlags';

const BOOKS_KEY = 'zeroup_books';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realBooksApi') && Boolean(API_BASE_URL);
}

// Admin CRUD (createBookAsAdmin/updateBookAsAdmin/deleteBookAsAdmin below)
// additionally needs a signed-in Administrator's token, since POST/PATCH/
// DELETE /books are Administrator-only on the backend — unlike the public
// GET /books syncBooksFromApi() reads.
function realAdminApiEnabled() {
  return realApiEnabled() && Boolean(getToken());
}

async function adminApiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${options.method || 'GET'} ${path} failed: ${res.status}`);
  return data;
}

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

// Stage 6 (frontend integration): hydrates the localStorage catalogue from
// the real backend/ Books API once, at app boot (see src/index.js) — every
// getBooks()/getBook() call site above keeps reading synchronously from
// that same cache, unchanged, rather than every one of this app's dozen
// call sites (Library, Home, Dashboard, Admin, Profile, SearchBar,
// Translation, Reading, onboarding) needing to become async/loading-state
// code. No-ops instantly when realBooksApi/REACT_APP_API_BASE_URL aren't
// configured. Never throws: a broken/unreachable API just leaves whatever
// catalogue is already cached in place instead of blocking the app from
// loading.
export async function syncBooksFromApi() {
  if (!realApiEnabled()) return;

  try {
    const listRes = await fetch(`${API_BASE_URL}/books`);
    if (!listRes.ok) throw new Error(`GET /books failed: ${listRes.status}`);
    const { books: summaries } = await listRes.json();

    const details = await Promise.all(
      summaries.map(async ({ id }) => {
        const res = await fetch(`${API_BASE_URL}/books/${id}`);
        if (!res.ok) throw new Error(`GET /books/${id} failed: ${res.status}`);
        const { book } = await res.json();
        return book;
      })
    );

    writeAll(details);
  } catch (err) {
    console.error('Failed to sync books from the real API — keeping the cached catalogue.', err);
  }
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

// Admin CMS (useBookUpload.js) — real-API-aware create/update/delete,
// separate from the plain createBook/updateBook/deleteBook above (which
// stay local-only and are shared with publishingService.js/
// translationService.js's own, not-yet-wired publish/approve flows — those
// get their own dedicated backend integration later, not this generic
// admin-books endpoint, since a Publisher/Translator/Editor calling it would
// get a real 403 from POST/PATCH/DELETE /books, which is Administrator-only).
// All three fall back to the local mock when the flag/URL/token aren't set,
// same { success, ... } result shape as authService.js's register()/login().
export async function createBookAsAdmin(payload) {
  if (realAdminApiEnabled()) {
    try {
      const { book } = await adminApiRequest('/books', { method: 'POST', body: JSON.stringify(payload) });
      writeAll([book, ...readAll()]);
      eventBus.emit('book.uploaded', { id: book.id, title: book.title });
      return { success: true, book };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }
  return { success: true, book: createBook(payload) };
}

export async function updateBookAsAdmin(id, patch) {
  if (realAdminApiEnabled()) {
    try {
      const { book } = await adminApiRequest(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      writeAll(readAll().map((existing) => (existing.id === id ? book : existing)));
      return { success: true, book };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }
  return { success: true, book: updateBook(id, patch) };
}

export async function deleteBookAsAdmin(id) {
  if (realAdminApiEnabled()) {
    try {
      await adminApiRequest(`/books/${id}`, { method: 'DELETE' });
      const remaining = readAll().filter((book) => book.id !== id);
      writeAll(remaining);
      eventBus.emit('book.deleted', { id });
      return { success: true, books: remaining };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }
  return { success: true, books: deleteBook(id) };
}
