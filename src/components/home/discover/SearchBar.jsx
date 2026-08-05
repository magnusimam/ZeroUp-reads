import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BOOK_LANGUAGES, BOOK_CATEGORIES, BOOK_LEVELS } from '../../../utils/mockData';
import { READING_LEVELS } from './discoverConfig';

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

// Full-width search bar sitting directly on the cream page background
// (screenshot-matched) — the single-card "Find a book" treatment moved to
// ExploreLanguages/ReadingLevelPicker as their own stacked sections.
export default function SearchBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [age, setAge] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  function goToLibrary(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    const resolvedLevel = age ? READING_LEVELS.find((r) => r.key === age)?.libraryLevel || '' : level;
    if (search) params.set('search', search);
    if (language) params.set('language', language);
    if (category) params.set('category', category);
    if (resolvedLevel) params.set('level', resolvedLevel);
    const qs = params.toString();
    navigate(qs ? `/library?${qs}` : '/library');
  }

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
        <div style={{ position: 'relative', flex: '2 1 220px', minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, topics or languages…"
            aria-label="Search books, topics or languages"
            style={{
              width: '100%', height: 48, padding: '0 14px 0 44px', borderRadius: 12,
              border: '1px solid #E7DFD0', fontFamily: 'Nunito Sans', fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
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
