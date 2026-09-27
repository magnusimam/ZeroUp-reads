import { useMemo, useState } from 'react';
import { SORT_OPTIONS, sortBooks, AGE_GROUP_ORDER } from './libraryConfig';
import { BOOK_LEVELS } from '../../utils/mockData';
import { searchBooks } from '../books/searchBooks';
import * as offlineService from '../reading/offlineService';

// Search + category + language + level + sort logic extracted out of LibraryPage's
// JSX so the page component stays presentational (Separation of Concerns).
export default function useLibraryFilters(books) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [language, setLanguage] = useState(null);
  const [level, setLevel] = useState(null);
  const [ageGroup, setAgeGroup] = useState(null);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [translatedOnly, setTranslatedOnly] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);

  const languageOptions = useMemo(
    () => [...new Set(books.map(b => b.language))].filter(Boolean).sort(),
    [books]
  );
  const levelOptions = useMemo(
    () => BOOK_LEVELS.filter(l => books.some(b => b.level === l)),
    [books]
  );
  const ageGroupOptions = useMemo(
    () => AGE_GROUP_ORDER.filter(a => books.some(b => b.ageGroup === a)),
    [books]
  );

  const filtered = useMemo(() => {
    let result = books;
    if (activeCategory) {
      result = result.filter(b => b.category === activeCategory);
    }
    if (language) {
      result = result.filter(b => b.language === language);
    }
    if (level) {
      result = result.filter(b => b.level === level);
    }
    if (ageGroup) {
      result = result.filter(b => b.ageGroup === ageGroup);
    }
    if (offlineOnly) {
      result = result.filter(b => offlineService.isDownloaded(b.id));
    }
    if (translatedOnly) {
      result = result.filter(b => (b.availableLanguages?.length || 0) > 1);
    }
    if (search.trim()) {
      // Matches title, author, category, language, reading level, description
      // and keyword-ish metadata (theme/tagline/learning objectives) — not
      // just title/author — so "History", "Finance" or "Yoruba" surface books
      // the same way a title search does (searchBooks.js is the shared rule).
      result = searchBooks(result, search);
    }
    return sortBooks(result, sort);
  }, [books, activeCategory, language, level, ageGroup, offlineOnly, translatedOnly, search, sort]);

  // True the moment any Sort/Filter/Search is applied — drives whether the
  // "Best For You" carousel (unfiltered, curated) or the filtered results
  // section takes the top spot on the Library page.
  const hasActiveFilters = Boolean(
    activeCategory || language || level || ageGroup || offlineOnly || translatedOnly
    || search.trim() || sort !== SORT_OPTIONS[0].value
  );

  function toggleCategory(category) {
    setActiveCategory(current => (current === category ? null : category));
  }

  function clearFilters() {
    setActiveCategory(null);
    setLanguage(null);
    setLevel(null);
    setAgeGroup(null);
    setOfflineOnly(false);
    setTranslatedOnly(false);
    setSort(SORT_OPTIONS[0].value);
  }

  return {
    search, setSearch,
    activeCategory, toggleCategory,
    language, setLanguage, languageOptions,
    level, setLevel, levelOptions,
    ageGroup, setAgeGroup, ageGroupOptions,
    offlineOnly, setOfflineOnly,
    translatedOnly, setTranslatedOnly,
    sort, setSort,
    clearFilters,
    filtered,
    hasActiveFilters,
  };
}
