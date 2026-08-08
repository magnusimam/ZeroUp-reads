import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../../books/BookCard';
import { STORY_THEMES, STORY_BOOKS_COUNT } from '../libraryConfig';
import useSectionFilter from '../useSectionFilter';

export default function StoryBooksSection({ books, viewAll = false, onTranslateRequest }) {
  const navigate = useNavigate();
  const {
    selected: theme, open: themeOpen, setOpen: setThemeOpen, select: selectTheme, filtered: themed,
  } = useSectionFilter(books, (b) => b.attributes?.theme);

  const visible = viewAll ? themed : themed.slice(0, STORY_BOOKS_COUNT);

  return (
    <section id="story-books" className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-2 h-8 rounded-full bg-gradient-to-b from-coral to-amber" aria-hidden="true" />
          <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-cocoa">📚 Story Books</h2>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setThemeOpen(o => !o)}
              className="px-4 py-2 rounded-full border-2 border-coral/30 bg-white text-charcoal/70 text-sm font-nunito font-bold hover:border-coral hover:text-cocoa transition-colors"
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

          <button
            onClick={() => navigate('/library?type=story')}
            className="px-4 py-2 rounded-full bg-coral text-white text-sm font-nunito font-bold hover:scale-105 transition-transform shadow-card"
          >
            View All →
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-charcoal/40 font-nunito-sans text-sm text-center py-10">
          No stories match your search yet — try another title or category! 🔎
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {visible.map(book => (
            <div key={book.id} className="transition-transform hover:-translate-y-1.5">
              <BookCard book={book} variant="portrait" onTranslateRequest={onTranslateRequest} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
