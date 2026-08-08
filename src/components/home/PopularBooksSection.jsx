import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookCoverArt from '../../modules/books/BookCoverArt';
import { POPULAR_BOOKS_HIGHLIGHT_COUNT } from '../../config/rules';

// Pastel pill per language, same tint set PopularBookCard used to carry —
// kept here for the featured card's language badge.
const LANGUAGE_PILL_CLASSES = {
  english: 'bg-navy/12 text-navy',
  swahili: 'bg-green/15 text-green',
  yoruba: 'bg-amber/20 text-[#8A5A00]',
  zulu: 'bg-coral/15 text-coral',
  french: 'bg-sky-blue/12 text-sky-blue',
  hausa: 'bg-sky-blue/12 text-sky-blue',
  igbo: 'bg-green/15 text-green',
  pidgin: 'bg-coral/15 text-coral',
  kanuri: 'bg-amber/20 text-[#8A5A00]',
  tiv: 'bg-navy/12 text-navy',
  efik: 'bg-green/15 text-green',
};
const DEFAULT_PILL_CLASS = 'bg-navy/12 text-navy';

// Same "featured card + compact list" layout as the Library page's
// Educational Books section (its "⭐ Top Pick" featured card), so Popular
// Books reads as the same visual pattern instead of its own one-off design.
export default function PopularBooksSection({ books }) {
  const navigate = useNavigate();

  const ranked = [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, POPULAR_BOOKS_HIGHLIGHT_COUNT);
  const featuredBook = ranked[0];
  const listBooks = ranked.slice(1);

  if (!featuredBook) return null;

  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-cocoa">Popular Books</h2>
          <p className="font-nunito-sans text-charcoal/50 text-sm mt-1">See what other children love</p>
        </div>
        <Link
          to="/library"
          className="font-nunito font-bold text-sm text-cocoa hover:text-coral transition-colors whitespace-nowrap mt-1"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Featured wide card */}
        <div
          className="lg:col-span-3 rounded-3xl overflow-hidden border-2 border-gold/25 bg-white grid grid-cols-1 sm:grid-cols-2 cursor-pointer group shadow-card hover:shadow-card-hover transition-shadow"
          onClick={() => navigate(`/read/${featuredBook.id}`)}
        >
          <div className="relative h-48 sm:h-full min-h-[220px]">
            <BookCoverArt category={featuredBook.category} style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-block self-start bg-gold/20 text-[#8A6800] text-xs font-nunito font-extrabold tracking-[0.1em] uppercase px-3 py-1 rounded-full">
                🔥 Most Popular
              </span>
              {featuredBook.language && (
                <span className={`inline-block text-xs font-nunito font-bold px-3 py-1 rounded-full ${LANGUAGE_PILL_CLASSES[featuredBook.language.toLowerCase()] || DEFAULT_PILL_CLASS}`}>
                  {featuredBook.language}
                </span>
              )}
            </div>
            <h3 className="font-playfair font-bold text-xl sm:text-2xl text-cocoa mb-3 leading-snug">
              {featuredBook.title}
            </h3>
            <p className="font-nunito-sans text-charcoal/60 text-sm leading-relaxed mb-6 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
              {featuredBook.description}
            </p>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/read/${featuredBook.id}`); }}
              className="self-start px-6 py-3 rounded-full bg-gold text-white font-nunito font-bold text-sm hover:opacity-90 transition-opacity group-hover:scale-[1.02]"
            >
              Start Reading
            </button>
          </div>
        </div>

        {/* Smaller list cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {listBooks.map(book => (
            <div
              key={book.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/read/${book.id}`)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/read/${book.id}`)}
              className="flex items-center gap-4 p-3 rounded-2xl border-2 border-gold/15 bg-black/[0.02] hover:border-gold/50 hover:bg-black/[0.04] hover:-translate-y-0.5 transition-all text-left cursor-pointer"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito font-bold text-sm text-charcoal truncate">{book.title}</p>
                <p className="font-nunito-sans text-xs text-charcoal/50">{book.language}</p>
              </div>
              <span className="text-cocoa text-sm font-nunito font-bold shrink-0">Read →</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
