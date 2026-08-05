import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookCard from '../../../modules/books/BookCard';
import { POPULAR_BOOKS_HIGHLIGHT_COUNT } from '../../../config/rules';

function arrowStyle(side) {
  return {
    position: 'absolute', top: '38%', [side]: -14,
    width: 32, height: 32, borderRadius: '50%',
    background: 'white', border: '1px solid #E7DFD0', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--navy)', boxShadow: '0 4px 12px rgba(31,61,110,0.15)',
    zIndex: 1,
  };
}

// Compact preview strip, not the full library carousel (BookCarousel) —
// deliberately simpler (native scroll + snap, no autoplay/dots) since it
// only ever shows a handful of books tucked inside a homepage card.
export default function PopularBooksHighlightCard({ books }) {
  const trackRef = useRef(null);
  const featured = [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, POPULAR_BOOKS_HIGHLIGHT_COUNT);

  function scrollByCard(dir) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild;
    const amount = card ? card.getBoundingClientRect().width + 12 : 160;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  return (
    <div className="home-card-lift" style={{
      background: 'white', borderRadius: 20, padding: 28,
      boxShadow: '0 8px 32px rgba(31,61,110,0.08)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 4px' }}>
            Popular Books
          </h3>
          <p style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: '#888', margin: 0 }}>
            See what other children love
          </p>
        </div>
        <Link to="/library" style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--navy)',
          textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 2,
        }}>View all →</Link>
      </div>

      <div style={{ position: 'relative', marginTop: 18, flex: 1 }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory',
            paddingBottom: 4, scrollbarWidth: 'none',
          }}
        >
          {featured.map((book) => (
            <div key={book.id} style={{ flex: '0 0 46%', minWidth: 130, scrollSnapAlign: 'start' }}>
              <BookCard book={book} compact shelf />
            </div>
          ))}
        </div>

        {featured.length > 2 && (
          <>
            <button onClick={() => scrollByCard(-1)} aria-label="Previous books" style={arrowStyle('left')}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollByCard(1)} aria-label="Next books" style={arrowStyle('right')}>
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
