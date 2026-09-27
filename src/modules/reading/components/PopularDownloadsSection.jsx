import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import DownloadBookCard from './DownloadBookCard';

export default function PopularDownloadsSection({ books }) {
  const scrollerRef = useRef(null);

  function scrollBy(amount) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (books.length === 0) return null;

  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="flex items-center gap-2 font-nunito font-extrabold text-xl" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true" style={{ color: 'var(--hero-orange)' }}>★</span> Popular Downloads
          </h2>
          <p className="font-nunito-sans text-sm mt-1" style={{ color: 'var(--hero-gray)' }}>
            Start building your offline library.
          </p>
        </div>
        <Link to="/library" className="font-nunito font-bold text-sm hover:underline" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>
          View all →
        </Link>
      </div>

      <div className="relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-320)}
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[var(--hero-border)] items-center justify-center shadow-card"
          style={{ color: 'var(--hero-ink)' }}
        >‹</button>

        <div ref={scrollerRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory">
          {books.map(book => (
            <div key={book.id} className="shrink-0 w-[190px] snap-start">
              <DownloadBookCard book={book} />
            </div>
          ))}
        </div>

        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(320)}
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full items-center justify-center shadow-card text-white"
          style={{ background: 'var(--navy)' }}
        >›</button>
      </div>
    </section>
  );
}
