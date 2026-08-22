import { BOOK_LANGUAGES } from '../../utils/mockData';
import { isFeatureEnabled } from '../../config/featureFlags';

const LANGUAGES_KEY = 'zeroup_languages';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Public endpoint (no per-user token) — same gate shape as booksService.js's
// realApiEnabled() for GET /books.
function realApiEnabled() {
  return isFeatureEnabled('realLanguagesApi') && Boolean(API_BASE_URL);
}

// Hydrates the localStorage languages list from the real API — called once
// at app boot (see src/index.js's bootstrap()), same seam as
// booksService.js's syncBooksFromApi(). Never throws; keeps the existing
// cache (or falls through to BOOK_LANGUAGES on read) if the API's
// unreachable.
export async function syncLanguagesFromApi() {
  if (!realApiEnabled()) return;
  try {
    const res = await fetch(`${API_BASE_URL}/languages`);
    if (!res.ok) throw new Error(`GET /languages failed: ${res.status}`);
    const { languages } = await res.json();
    localStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages));
  } catch (err) {
    console.error('Failed to sync languages from the real API — keeping the existing list.', err);
  }
}

// Synchronous, like getBooks() — reads the boot-synced cache, falling back
// to the static BOOK_LANGUAGES taxonomy (same 11 values the backend table is
// seeded from) if the cache was never populated (API never enabled, or
// unreachable at boot). Returns plain names, matching how BOOK_LANGUAGES is
// already consumed everywhere (code and name are identical for every
// currently-seeded language).
export function getLanguages() {
  const saved = localStorage.getItem(LANGUAGES_KEY);
  if (!saved) return BOOK_LANGUAGES;
  const languages = JSON.parse(saved);
  return languages.length > 0 ? languages.map((l) => l.name) : BOOK_LANGUAGES;
}
