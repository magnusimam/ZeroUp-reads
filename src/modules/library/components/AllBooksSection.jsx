import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../../books/BookCard';
import { ALL_BOOKS_PREVIEW_COUNT, SORT_OPTIONS, sortBooks, topicsFor } from '../libraryConfig';
import useSectionFilter from '../useSectionFilter';

// The Library's one book list. ZeroUp Reads teaches through stories — a book
// about AI, money or the human body is still a storybook — so there's no
// separate "Story" vs "Educational" split; readers narrow by topic instead.
// `resultsTitle` (set while a search/filter is active) swaps the heading for
// a description of what was asked for, with a match count and Clear button.
export default function AllBooksSection({ books, viewAll = false, resultsTitle = null, onClearFilters, onTranslateRequest }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [localSort, setLocalSort] = useState(SORT_OPTIONS[0].value);
  const topics = useMemo(() => topicsFor(books), [books]);
  const {
    selected: topic, open: topicOpen, setOpen: setTopicOpen, select: selectTopic, filtered: topicFiltered,
  } = useSectionFilter(books, (b) => b.category);

  const sorted = sortBooks(topicFiltered, localSort);
  const visible = viewAll ? sorted : sorted.slice(0, ALL_BOOKS_PREVIEW_COUNT);

  return (
    <section id="all-books" className="max-w-content mx-auto w-full px-4 sm:px-6 py-8">
      <span id="all-books-start" className="block -mt-28 pt-28" aria-hidden="true" />

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        {resultsTitle ? (
          <div>
            <h2 className="flex items-center gap-2 font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>
              <span aria-hidden="true">🔎</span> {resultsTitle}
            </h2>
            <p className="font-nunito-sans text-sm mt-1 flex items-center gap-3 flex-wrap" style={{ color: 'var(--hero-gray)' }}>
              {sorted.length} {sorted.length === 1 ? 'book' : 'books'}
              {onClearFilters && (
                <button type="button" onClick={onClearFilters} className="font-nunito font-bold hover:underline" style={{ color: 'var(--hero-orange)' }}>
                  Clear filters ×
                </button>
              )}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="flex items-center gap-2 font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>
              <span aria-hidden="true">📚</span> All Books
            </h2>
            <p className="font-nunito-sans text-sm mt-1" style={{ color: 'var(--hero-gray)' }}>
              Storybooks that teach — science, technology, AI, health, culture and more, in your language.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setTopicOpen(o => !o)}
              className="px-4 py-2 rounded-full border text-sm font-nunito font-bold bg-white"
              style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
            >
              {topic || 'Choose Topic'} <span aria-hidden="true">{topicOpen ? '▲' : '▼'}</span>
            </button>
            {topicOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTopicOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gold/25 bg-white shadow-xl z-20 py-2 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => selectTopic(null)}
                    className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                      !topic ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                    }`}
                  >
                    All Topics
                  </button>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => selectTopic(t)}
                      className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                        topic === t ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                      }`}
                    >
                      {t}
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

          {!viewAll && sorted.length > visible.length && (
            <button
              onClick={() => navigate('/library?type=all')}
              className="px-4 py-2 rounded-full text-white text-sm font-nunito font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'var(--hero-green)' }}
            >
              View All →
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="font-nunito-sans text-sm text-center py-10" style={{ color: 'var(--hero-gray)' }}>
          No books match your search yet — try another title or topic! 🔎
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
