import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as booksService from '../books/booksService';
import { matchesSearch } from '../books/searchBooks';
import { preferCoveredBooks, sortBooks } from '../library/libraryConfig';
import { MACHINE_TRANSLATION_LANGUAGES, getMachineLanguage } from './machineTranslationConfig';
import * as machineTranslationService from './machineTranslationService';
import { STORY_PICKER_PAGE_SIZE } from './translatePageConfig';

// State + logic for the "Translate a Story" page (Separation of Concerns —
// TranslatePage and its components stay presentational): pick a story →
// pick a language → preview the first page → open it in the reader.
// `?book=<id>` (from a book's "Translate this story" button) preselects the
// story and starts at step 2.
export default function useTranslatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const allBooks = useMemo(() => booksService.getBooks(), []);
  // Hand-translated copies are separate books (attributes.translatedFrom) —
  // readers pick the original here, and we route them to a copy if one fits.
  const originals = useMemo(() => allBooks.filter(b => !b.attributes?.translatedFrom), [allBooks]);

  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(STORY_PICKER_PAGE_SIZE);
  const [book, setBook] = useState(() => booksService.getBook(searchParams.get('book')) || null);
  const [languageCode, setLanguageCode] = useState(() => machineTranslationService.getTargetLanguage()?.code || null);
  const [preview, setPreview] = useState({ key: null, text: null, status: 'idle' });

  const matchingBooks = useMemo(() => {
    const matches = originals.filter(b => matchesSearch(b, query));
    return query.trim() ? matches : sortBooks(preferCoveredBooks(matches), 'reads');
  }, [originals, query]);
  const visibleBooks = matchingBooks.slice(0, visibleCount);

  useEffect(() => { setVisibleCount(STORY_PICKER_PAGE_SIZE); }, [query]);

  const languages = book ? MACHINE_TRANSLATION_LANGUAGES.filter(l => l.name !== book.language) : MACHINE_TRANSLATION_LANGUAGES;
  const language = getMachineLanguage(languageCode);
  const validLanguage = language && book && language.name !== book.language ? language : null;

  // A hand-translated copy of this story in the chosen language, if our team has made one.
  const humanTranslations = useMemo(() => {
    if (!book) return {};
    const map = {};
    allBooks.forEach(b => { if (b.attributes?.translatedFrom === book.id) map[b.language] = b; });
    return map;
  }, [allBooks, book]);
  const humanCopy = validLanguage ? humanTranslations[validLanguage.name] || null : null;

  const firstPage = book?.content?.[0] || '';
  const previewKey = validLanguage && !humanCopy && firstPage ? `${validLanguage.code}:${book.id}` : null;

  useEffect(() => {
    if (!previewKey) return undefined;
    let cancelled = false;
    setPreview({ key: previewKey, text: null, status: 'loading' });
    machineTranslationService.translateText(firstPage, validLanguage.code)
      .then(text => { if (!cancelled) setPreview({ key: previewKey, text, status: 'done' }); })
      .catch(() => { if (!cancelled) setPreview({ key: previewKey, text: null, status: 'error' }); });
    return () => { cancelled = true; };
  }, [previewKey, firstPage, validLanguage]);

  const previewState = humanCopy
    ? { status: 'human', text: humanCopy.content?.[0] || '' }
    : preview.key === previewKey ? preview : { status: previewKey ? 'loading' : 'idle', text: null };

  // 1 = pick story, 2 = pick language, 3 = preview
  const step = !book ? 1 : !validLanguage ? 2 : 3;

  function chooseBook(next) {
    setBook(next);
  }

  function changeBook() {
    setBook(null);
  }

  function startReading() {
    if (!book || !validLanguage) return;
    machineTranslationService.setTargetLanguage(validLanguage.code);
    navigate(`/read/${(humanCopy || book).id}`);
  }

  return {
    query, setQuery,
    visibleBooks, hasMoreBooks: matchingBooks.length > visibleBooks.length, showMoreBooks: () => setVisibleCount(c => c + STORY_PICKER_PAGE_SIZE),
    book, chooseBook, changeBook,
    languages, language: validLanguage, chooseLanguage: setLanguageCode, humanTranslations,
    firstPage, preview: previewState,
    step, startReading,
  };
}
