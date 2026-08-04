import React, { useEffect, useState } from 'react';
import BookCard from '../../books/BookCard';
import { CAROUSEL } from '../libraryConfig';

// Shortest signed distance from `index` to `center` on a ring of size `len` —
// lets the carousel loop both directions instead of dead-ending at the edges.
function circularOffset(index, center, len) {
  let diff = index - center;
  if (diff > len / 2) diff -= len;
  if (diff < -len / 2) diff += len;
  return diff;
}

// Small CSS-drawn sparkle (not an emoji glyph) used to flank the "Best Picks" title.
function GoldSparkle() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
        clipPath: 'polygon(50% 0%, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0% 50%, 37% 37%)',
        filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.75))',
      }}
    />
  );
}

export default function BestForYouCarousel({ books }) {
  const [centerIndex, setCenterIndex] = useState(Math.floor(books.length / 2));
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (books.length === 0) return null;

  const len = books.length;
  const sideCount = isMobile ? CAROUSEL.SIDE_COUNT_MOBILE : CAROUSEL.SIDE_COUNT;
  const spacing = isMobile ? CAROUSEL.CARD_SPACING_MOBILE_PX : CAROUSEL.CARD_SPACING_PX;
  const sideScale = isMobile ? CAROUSEL.SIDE_SCALE_MOBILE : CAROUSEL.SIDE_SCALE;
  const sideOpacity = isMobile ? CAROUSEL.SIDE_OPACITY_MOBILE : CAROUSEL.SIDE_OPACITY;
  const centerLift = isMobile ? CAROUSEL.CENTER_LIFT_MOBILE_PX : CAROUSEL.CENTER_LIFT_PX;

  function goTo(delta) {
    setCenterIndex(i => (i + delta + len) % len);
  }

  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10">
        <span
          className="hidden sm:block w-12 h-px bg-gradient-to-r from-transparent via-gold/70 to-gold"
          aria-hidden="true"
        />
        <h2 className="flex items-center gap-3 sm:gap-4 font-playfair font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-wide text-center text-cocoa">
          <GoldSparkle />
          <span>Best Picks</span>
          <GoldSparkle />
        </h2>
        <span
          className="hidden sm:block w-12 h-px bg-gradient-to-l from-transparent via-gold/70 to-gold"
          aria-hidden="true"
        />
      </div>

      <div className="relative h-[380px] sm:h-[520px]" style={{ perspective: 1200 }}>
        {books.map((book, i) => {
          const offset = circularOffset(i, centerIndex, len);
          const abs = Math.abs(offset);
          if (abs > sideCount) return null;

          const isCenter = offset === 0;
          const scale = isCenter ? CAROUSEL.CENTER_SCALE
            : abs === 1 ? sideScale
            : CAROUSEL.FAR_SCALE;
          const opacity = isCenter ? 1
            : abs === 1 ? sideOpacity
            : CAROUSEL.FAR_OPACITY;
          const lift = isCenter ? -centerLift : 0;
          const translateX = offset * spacing;

          return (
            <div
              key={book.id}
              onClickCapture={e => {
                if (!isCenter) {
                  e.stopPropagation();
                  setCenterIndex(i);
                }
              }}
              className="absolute top-1/2 left-1/2 w-[200px] sm:w-[240px] md:w-[260px]"
              style={{
                transform: `translate(-50%, calc(-50% + ${lift}px)) translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex: 100 - abs,
                transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease',
                pointerEvents: abs > sideCount ? 'none' : 'auto',
              }}
            >
              <BookCard book={book} variant="portrait" bottomBadge={isCenter ? 'RECOMMENDED' : undefined} />
            </div>
          );
        })}

        {/* Arrows */}
        <button
          aria-label="Previous book"
          onClick={() => goTo(-1)}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-[200] w-11 h-11 rounded-full bg-ink/70 border border-gold/40 text-gold text-xl flex items-center justify-center hover:bg-gold hover:text-ink transition-colors backdrop-blur"
        >
          ‹
        </button>
        <button
          aria-label="Next book"
          onClick={() => goTo(1)}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-[200] w-11 h-11 rounded-full bg-ink/70 border border-gold/40 text-gold text-xl flex items-center justify-center hover:bg-gold hover:text-ink transition-colors backdrop-blur"
        >
          ›
        </button>
      </div>
    </section>
  );
}
