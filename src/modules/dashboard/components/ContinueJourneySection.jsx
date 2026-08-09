import React, { useRef } from 'react';
import ContinueJourneyCard from './ContinueJourneyCard';

export default function ContinueJourneySection({ books }) {
  const trackRef = useRef(null);

  function scrollNext() {
    trackRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  }

  return (
    <section>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--hero-ink)', margin: '0 0 14px' }}>
        Continue Your Journey
      </h2>

      {books.length === 0 ? (
        <div style={{
          background: 'white', border: '1px dashed var(--hero-border)', borderRadius: 22,
          padding: '28px 24px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 14, color: 'var(--hero-gray)' }}>
            Nothing in progress yet — pick a story below to start your journey!
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            ref={trackRef}
            style={{
              display: 'flex', gap: 18, overflowX: 'auto', scrollSnapType: 'x mandatory',
              paddingBottom: 4,
            }}
          >
            {books.map((book) => (
              <div key={book.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
                <ContinueJourneyCard book={book} />
              </div>
            ))}
          </div>

          {books.length > 2 && (
            <button
              onClick={scrollNext}
              aria-label="Scroll to next book"
              style={{
                position: 'absolute', right: -8, top: '40%',
                width: 40, height: 40, borderRadius: '50%',
                background: 'white', border: '1px solid var(--hero-border)',
                boxShadow: '0 8px 20px rgba(58,26,16,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16,
              }}
            >›</button>
          )}
        </div>
      )}
    </section>
  );
}
