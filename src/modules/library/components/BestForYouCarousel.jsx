import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

// "Featured Books" — a flat shelf of near-equal cards with exactly one book
// raised and centered at a time (the reference design's floating card),
// its neighbors sitting at full size and opacity beside it rather than
// fanning away into a 3D coverflow. Clicking a side card re-centers it.
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
    <section className="relative max-w-content mx-auto w-full px-4 sm:px-6 py-4">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="flex items-center gap-2 font-nunito font-extrabold text-2xl" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true" style={{ color: 'var(--hero-orange)' }}>★</span> Featured Books
          </h2>
          <p className="font-nunito-sans text-sm mt-1" style={{ color: 'var(--hero-gray)' }}>
            Handpicked stories for young readers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/library?type=story"
            className="font-nunito font-bold text-sm hover:underline"
            style={{ color: 'var(--hero-ink)' }}
          >
            View all →
          </Link>
          <div className="flex gap-2">
            <button
              aria-label="Previous book"
              onClick={() => goTo(-1)}
              className="w-8 h-8 rounded-full bg-white border border-[var(--hero-border)] flex items-center justify-center hover:bg-black/5 transition-colors"
              style={{ color: 'var(--hero-ink)' }}
            >‹</button>
            <button
              aria-label="Next book"
              onClick={() => goTo(1)}
              className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ background: 'var(--hero-ink)' }}
            >›</button>
          </div>
        </div>
      </div>

      {/* overflow-hidden clips a peeking side card at narrow widths instead
          of letting it push the whole page into horizontal scroll. */}
      <div className="relative h-[280px] sm:h-[380px] overflow-hidden">
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
              className="absolute top-1/2 left-1/2 w-[140px] sm:w-[190px]"
              style={{
                transform: `translate(-50%, calc(-50% + ${lift}px)) translateX(${translateX}px) scale(${scale})`,
                opacity,
                // Capped well below the sticky Navbar's z-index (100) — these
                // only need to stack among themselves, not compete with page
                // chrome once the carousel scrolls under a sticky header.
                zIndex: 20 - abs,
                transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease',
                pointerEvents: abs > sideCount ? 'none' : 'auto',
              }}
            >
              {isCenter ? (
                <div className="rounded-2xl overflow-hidden shadow-card-hover">
                  <BookCard book={book} variant="portrait" bottomBadge="RECOMMENDED" />
                </div>
              ) : (
                <BookCard book={book} variant="tile" showCta ctaLabel="View Details" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
