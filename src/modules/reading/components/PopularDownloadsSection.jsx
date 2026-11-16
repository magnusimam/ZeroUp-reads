import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import DownloadBookCard from './DownloadBookCard';

export default function PopularDownloadsSection({ books, recommendedBookId }) {
  const scrollerRef = useRef(null);

  function scrollBy(amount) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (books.length === 0) return null;

  const arrow = 'hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center text-white shadow-[0_6px_14px_rgba(1,32,114,0.35)] hover:brightness-125 transition';

  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-start gap-3">
          <Star size={38} fill="#FDB51A" color="#FDB51A" className="shrink-0 -mt-1" aria-hidden="true" />
          <div>
            <h2 className="font-nunito font-extrabold text-xl" style={{ color: '#0B1F4D' }}>Popular Downloads</h2>
            <p className="font-nunito-sans text-sm" style={{ color: '#3B4660' }}>Start building your offline library.</p>
          </div>
        </div>
        <Link to="/library" className="flex items-center gap-1.5 font-nunito font-extrabold text-sm hover:underline mt-2" style={{ color: '#1466E6' }}>
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="relative sm:px-8">
        <button aria-label="Scroll left" onClick={() => scrollBy(-360)} className={`${arrow} left-0`} style={{ background: '#012072' }}>
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollerRef}
          className="flex items-center gap-4 overflow-x-auto py-4 px-1 scroll-smooth snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {books.map(book => {
            const featured = book.id === recommendedBookId;
            return (
              <div key={book.id} className={`shrink-0 snap-start ${featured ? 'w-[188px]' : 'w-[175px]'}`}>
                <DownloadBookCard book={book} featured={featured} />
              </div>
            );
          })}
        </div>

        <button aria-label="Scroll right" onClick={() => scrollBy(360)} className={`${arrow} right-0`} style={{ background: '#012072' }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
