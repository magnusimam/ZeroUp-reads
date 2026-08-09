// Single source of truth for "does this book match this search query" (Modular
// Architecture) — used by the homepage SearchBar's live dropdown and the
// Library page's search/filter bar, so typing "History" or "Yoruba" finds the
// same books no matter which search box you used.

function normalize(value) {
  return (value || '').toString().toLowerCase();
}

// Every field a reader might reasonably search by: title, author, category,
// language (including languages a book has been translated into), reading
// level, description, and the free-text theme/tagline/learning-objective copy
// that acts as this book's keywords.
function searchHaystack(book) {
  const objectiveText = (book.attributes?.learningObjectives || [])
    .map((o) => (typeof o === 'string' ? o : `${o.title || ''} ${o.description || ''}`));

  return [
    book.title,
    book.author,
    book.category,
    book.language,
    book.level,
    book.description,
    book.attributes?.theme,
    book.attributes?.tagline,
    ...(book.attributes?.availableLanguages || []),
    ...objectiveText,
  ]
    .filter(Boolean)
    .map(normalize)
    .join(' | ');
}

export function matchesSearch(book, query) {
  const q = normalize(query).trim();
  if (!q) return true;
  return searchHaystack(book).includes(q);
}

export function searchBooks(books, query) {
  const q = normalize(query).trim();
  if (!q) return books;
  return books.filter((book) => matchesSearch(book, q));
}
