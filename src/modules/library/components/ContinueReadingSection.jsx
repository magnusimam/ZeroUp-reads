import React from 'react';
import BookCard from '../../books/BookCard';
import AmbientDecor from '../../../components/home/AmbientDecor';

// Only rendered when a logged-in reader actually has books in progress —
// LibraryPage decides that, this component just renders the row. Uses
// BookCard's default variant (not "portrait") because that's the one that
// already draws the "Page X of Y" progress bar.
export default function ContinueReadingSection({ userName, books, onTranslateRequest }) {
  if (!books || books.length === 0) return null;

  const firstName = userName ? userName.split(' ')[0] : 'friend';

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF3D6 0%, #FFE9B8 100%)' }}>
      <AmbientDecor count={5} offset={4} />

      <div className="relative z-10 max-w-content mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl animate-[float_3s_ease-in-out_infinite]" aria-hidden="true">📖</span>
          <h2 className="font-playfair font-extrabold text-2xl sm:text-3xl text-cocoa">
            Keep Going, {firstName}!
          </h2>
          <span className="hidden sm:inline-block bg-coral text-white text-xs font-nunito font-extrabold px-3 py-1 rounded-full shadow-card">
            {books.length} in progress
          </span>
        </div>
        <p className="font-nunito-sans text-charcoal/60 text-sm sm:text-base mb-6 ml-11">
          You're doing great — pick up right where you left off. 🌟
        </p>

        <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {books.map((book) => (
            <div
              key={book.id}
              className="shrink-0 w-[220px] sm:w-[240px] snap-start rounded-2xl transition-transform hover:-translate-y-1 hover:rotate-1"
            >
              <BookCard book={book} compact ctaLabel="Continue Reading" onTranslateRequest={onTranslateRequest} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
