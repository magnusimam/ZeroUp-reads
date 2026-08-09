import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { BOOK_LANGUAGES, BOOK_CATEGORIES, BOOK_LEVELS } from '../../../utils/mockData';
import { READING_LEVELS } from './discoverConfig';
import * as booksService from '../../../modules/books/booksService';
import BookCoverArt from '../../../modules/books/BookCoverArt';
import { searchBooks } from '../../../modules/books/searchBooks';
import { SEARCH_RESULTS_LIMIT } from '../../../config/rules';

const selectStyle = {
  flex: '1 1 140px',
  minWidth: 130,
  height: 48,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid #E7DFD0',
  background: 'white',
  color: 'var(--charcoal)',
  fontFamily: 'Nunito Sans',
  fontSize: 14,
};

// One live result row in the type-ahead dropdown — cover, title, author,
// rating, category, reading level, languages, and a "Read Now" CTA, exactly
// what a reader needs to judge a match without leaving the homepage.
function SearchResultRow({ book, onSelect }) {
  const languages = book.attributes?.availableLanguages?.length
    ? book.attributes.availableLanguages
    : [book.language];

  return (
    <div
      onClick={() => onSelect(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(book)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
        borderBottom: '1px solid #F1EAD9', background: 'white',
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FBF7EE'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--charcoal)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {book.title}
        </div>
        <div style={{ fontFamily: 'Nunito Sans', fontSize: 12, color: '#888', margin: '1px 0 5px' }}>
          by {book.author}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {typeof book.rating === 'number' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontFamily: 'Nunito', fontWeight: 800, color: 'var(--charcoal)' }}>
              <Star size={11} fill="var(--gold)" stroke="none" /> {book.rating.toFixed(1)}
            </span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', padding: '2px 9px', borderRadius: 99, background: 'rgba(31,61,110,0.08)', color: 'var(--navy)' }}>
            {book.category}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', padding: '2px 9px', borderRadius: 99, background: 'rgba(61,190,138,0.15)', color: 'var(--green)' }}>
            {book.level}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', padding: '2px 9px', borderRadius: 99, background: 'rgba(232,160,32,0.15)', color: '#B8862E' }}>
            {languages.join(', ')}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(book); }}
        style={{
          flexShrink: 0, fontSize: 12, fontWeight: 800, fontFamily: 'Nunito',
          color: 'white', background: 'var(--hero-orange)', border: 'none',
          padding: '8px 14px', borderRadius: 99, whiteSpace: 'nowrap', cursor: 'pointer',
        }}
      >
        Read Now
      </button>
    </div>
  );
}

// Full-width search bar sitting directly on the cream page background
// (screenshot-matched) — the single-card "Find a book" treatment moved to
// ExploreLanguages/ReadingLevelPicker as their own stacked sections.
export default function SearchBar() {
  const navigate = useNavigate();
  const [books] = useState(() => booksService.getBooks());
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [age, setAge] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Live results — recomputed on every keystroke so the dropdown updates
  // instantly, no submit required (Enter/the search button still hand off to
  // the full Library page below).
  const results = useMemo(
    () => (search.trim() ? searchBooks(books, search) : []),
    [books, search]
  );
  const visibleResults = results.slice(0, SEARCH_RESULTS_LIMIT);
  const moreCount = Math.max(0, results.length - visibleResults.length);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function goToLibrary(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    const resolvedLevel = age ? READING_LEVELS.find((r) => r.key === age)?.libraryLevel || '' : level;
    if (search) params.set('search', search);
    if (language) params.set('language', language);
    if (category) params.set('category', category);
    if (resolvedLevel) params.set('level', resolvedLevel);
    const qs = params.toString();
    setDropdownOpen(false);
    navigate(qs ? `/library?${qs}` : '/library');
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setDropdownOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setDropdownOpen(false);
  }

  function handleSelectResult(book) {
    setDropdownOpen(false);
    navigate(`/book/${book.id}`);
  }

  const showDropdown = dropdownOpen && search.trim().length > 0;

  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 26, color: 'var(--navy)', margin: '0 0 14px', textAlign: 'center' }}>
        Find Your Next Book
      </h2>
      <form
        onSubmit={goToLibrary}
        style={{
          background: 'white', borderRadius: 20, padding: 16,
          boxShadow: '0 8px 32px rgba(31,61,110,0.10)',
          display: 'flex', flexWrap: 'wrap', gap: 10,
        }}
      >
        <div ref={containerRef} style={{ position: 'relative', flex: '2 1 220px', minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            onFocus={() => search.trim() && setDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, topics or languages…"
            aria-label="Search books, topics or languages"
            autoComplete="off"
            style={{
              width: '100%', height: 48, padding: '0 14px 0 44px', borderRadius: 12,
              border: '1px solid #E7DFD0', fontFamily: 'Nunito Sans', fontSize: 15,
              boxSizing: 'border-box',
            }}
          />

          {showDropdown && (
            <div
              role="listbox"
              aria-label="Search results"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'white', borderRadius: 16, boxShadow: '0 16px 40px rgba(31,61,110,0.18)',
                border: '1px solid #F1EAD9', overflow: 'hidden', zIndex: 50,
                maxHeight: 420, overflowY: 'auto',
              }}
            >
              {visibleResults.length > 0 ? (
                <>
                  {visibleResults.map((book) => (
                    <SearchResultRow key={book.id} book={book} onSelect={handleSelectResult} />
                  ))}
                  {(moreCount > 0 || visibleResults.length > 0) && (
                    <button
                      type="button"
                      onClick={goToLibrary}
                      style={{
                        display: 'block', width: '100%', padding: '12px 14px',
                        background: '#FBF7EE', border: 'none', cursor: 'pointer',
                        fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: 'var(--hero-orange)',
                      }}
                    >
                      {moreCount > 0 ? `See all ${results.length} results in Library →` : 'See in Library →'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, lineHeight: 1 }} aria-hidden="true">🔎📚</div>
                  <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--charcoal)', margin: '12px 0 4px' }}>
                    No books found
                  </p>
                  <p style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: '#888', margin: 0 }}>
                    We couldn't find any books matching your search. Try another keyword.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
          <option value="">Language</option>
          {BOOK_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select aria-label="Age" value={age} onChange={(e) => setAge(e.target.value)} style={selectStyle}>
          <option value="">Age</option>
          {READING_LEVELS.map((r) => <option key={r.key} value={r.key}>{r.ageRange}</option>)}
        </select>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option value="">Category</option>
          {BOOK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Reading level" value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
          <option value="">Reading level</option>
          {BOOK_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <button
          type="submit"
          aria-label="Search"
          style={{
            width: 48, height: 48, borderRadius: 12, border: 'none', background: 'var(--navy)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
}
