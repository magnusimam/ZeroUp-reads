import React, { useState, useEffect } from 'react';
import BookCard from '../../modules/books/BookCard';

/* ── BOOK CAROUSEL ───────────────────────────────────────── */
export default function BookCarousel({ books }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const total = books.length;

  // Determine visible count based on window width
  const [visibleCount, setVisibleCount] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setVisibleCount(1.2);
      else if (window.innerWidth < 1280) setVisibleCount(2);
      else setVisibleCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Auto-advance every 4s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 4000);
    return () => clearInterval(t);
  }, [isHovered, total]);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const handleTouchStart = e => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = e => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cards track */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{
          display: 'flex', gap: 24,
          transform: `translateX(calc(-${current * (100 / Math.floor(visibleCount))}% - ${current * 24 / Math.floor(visibleCount)}px))`,
          transition: 'transform 350ms ease-out',
        }}>
          {books.map((book, i) => (
            <div key={book.id} style={{
              flexShrink: 0,
              width: `calc(${100 / Math.floor(visibleCount)}% - ${(Math.floor(visibleCount) - 1) * 24 / Math.floor(visibleCount)}px)`,
            }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 32 }}>
        <button onClick={prev} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--navy)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--amber)', fontSize: 18,
          transition: 'transform 200ms ease, background 200ms ease',
          boxShadow: '0 4px 16px rgba(31,61,110,0.2)',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Previous"
        >←</button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {books.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 10, height: 10,
              borderRadius: 99,
              background: i === current ? 'var(--navy)' : '#DDDDDD',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 300ms ease',
            }} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>

        <button onClick={next} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--navy)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--amber)', fontSize: 18,
          transition: 'transform 200ms ease, background 200ms ease',
          boxShadow: '0 4px 16px rgba(31,61,110,0.2)',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Next"
        >→</button>
      </div>
    </div>
  );
}
