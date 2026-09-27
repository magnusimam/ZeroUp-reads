import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../../books/BookCard';
import { EDUCATIONAL_TOPICS, EDUCATIONAL_SMALL_COUNT, SORT_OPTIONS, sortBooks } from '../libraryConfig';
import useSectionFilter from '../useSectionFilter';

export default function EducationalBooksSection({ books, viewAll = false, onTranslateRequest }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [localSort, setLocalSort] = useState(SORT_OPTIONS[0].value);
  const {
    selected: topic, open: topicOpen, setOpen: setTopicOpen, select: selectTopic, filtered: topicFiltered,
  } = useSectionFilter(books, (b) => b.category);

  const sorted = sortBooks(topicFiltered, localSort);
  const visible = viewAll ? sorted : sorted.slice(0, EDUCATIONAL_SMALL_COUNT);

  return (
    <section id="educational-books" className="max-w-content mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="flex items-center gap-2 font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true">🔬</span> Educational Books
          </h2>
          <p className="font-nunito-sans text-sm mt-1" style={{ color: 'var(--hero-gray)' }}>
            Explore thousands of books in your language.
          </p>
        </div>

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
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gold/25 bg-white shadow-xl z-20 py-2">
                  <button
                    onClick={() => selectTopic(null)}
                    className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                      !topic ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                    }`}
                  >
                    All Topics
                  </button>
                  {EDUCATIONAL_TOPICS.map(t => (
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

          <button
            onClick={() => navigate('/library?type=educational')}
            className="px-4 py-2 rounded-full text-white text-sm font-nunito font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--hero-orange)' }}
          >
            Explore All →
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="font-nunito-sans text-sm text-center py-10" style={{ color: 'var(--hero-gray)' }}>
          No educational resources match your filters yet. 🔎
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
