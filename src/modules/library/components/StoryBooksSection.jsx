import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../../books/BookCard';
import { STORY_THEMES, STORY_BOOKS_COUNT, SORT_OPTIONS, sortBooks } from '../libraryConfig';
import useSectionFilter from '../useSectionFilter';

export default function StoryBooksSection({ books, viewAll = false, onTranslateRequest }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [localSort, setLocalSort] = useState(SORT_OPTIONS[0].value);
  const {
    selected: theme, open: themeOpen, setOpen: setThemeOpen, select: selectTheme, filtered: themed,
  } = useSectionFilter(books, (b) => b.attributes?.theme);

  const sorted = sortBooks(themed, localSort);
  const visible = viewAll ? sorted : sorted.slice(0, STORY_BOOKS_COUNT);

  return (
    <section id="story-books" className="max-w-content mx-auto w-full px-4 sm:px-6 py-8">
      <span id="all-books-start" className="block -mt-28 pt-28" aria-hidden="true" />

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="flex items-center gap-2 font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true">📚</span> Story Books
          </h2>
          <p className="font-nunito-sans text-sm mt-1" style={{ color: 'var(--hero-gray)' }}>
            Tales and folklore in your language.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setThemeOpen(o => !o)}
              className="px-4 py-2 rounded-full border text-sm font-nunito font-bold bg-white"
              style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
            >
              {theme || 'Select Theme'} <span aria-hidden="true">{themeOpen ? '▲' : '▼'}</span>
            </button>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gold/25 bg-white shadow-xl z-20 py-2 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => selectTheme(null)}
                    className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                      !theme ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                    }`}
                  >
                    All Themes
                  </button>
                  {STORY_THEMES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => selectTheme(cat)}
                      className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                        theme === cat ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <select
            aria-label="Sort by"
            value={localSort}
            onChange={e => setLocalSort(e.target.value)}
            className="px-4 py-2 rounded-full border text-sm font-nunito font-bold bg-white"
            style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: 'var(--hero-border)' }}>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className="w-9 h-9 flex items-center justify-center text-sm"
              style={viewMode === 'grid' ? { background: 'var(--hero-ink)', color: 'white' } : { background: 'white', color: 'var(--hero-ink)' }}
            >▦</button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className="w-9 h-9 flex items-center justify-center text-sm"
              style={viewMode === 'list' ? { background: 'var(--hero-ink)', color: 'white' } : { background: 'white', color: 'var(--hero-ink)' }}
            >☰</button>
          </div>

          <button
            onClick={() => navigate('/library?type=story')}
            className="px-4 py-2 rounded-full text-white text-sm font-nunito font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--hero-green)' }}
          >
            View All →
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="font-nunito-sans text-sm text-center py-10" style={{ color: 'var(--hero-gray)' }}>
          No stories match your search yet — try another title or category! 🔎
        </p>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5'
          : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
        }>
          {visible.map(book => (
            <BookCard key={book.id} book={book} variant="tile" onTranslateRequest={onTranslateRequest} />
          ))}
        </div>
      )}
    </section>
  );
}
