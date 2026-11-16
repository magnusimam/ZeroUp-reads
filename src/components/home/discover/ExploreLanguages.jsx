import React from 'react';
import { Link } from 'react-router-dom';
import { Grid3x3 } from 'lucide-react';
import { POPULAR_LANGUAGES } from './discoverConfig';

export default function ExploreLanguages() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 14px' }}>
        Explore in your language
      </h2>
      {/* Mobile: one swipeable line instead of wrapping to a tall stack (or
          clipping chips); the "View all" chip is pinned to the front (CSS
          order) so it's always the first thing in reach. */}
      <div className="explore-langs-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {POPULAR_LANGUAGES.map(({ name, color, flag }, i) => (
          <Link
            key={name}
            to={`/library?language=${encodeURIComponent(name)}`}
            className="lang-chip"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: color, color: 'white',
              borderRadius: 99, padding: '8px 16px 8px 8px',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', transition: 'transform 200ms ease, box-shadow 200ms ease',
              animation: `chipGlow 3.2s ease-in-out ${i * 0.3}s infinite`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          >
            <span style={{
              width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: 13,
            }}>
              {flag}
            </span>
            {name}
          </Link>
        ))}
        <Link
          to="/library"
          className="chip-pin-first"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--navy)', border: '1px solid #E7DFD0',
            borderRadius: 99, padding: '8px 16px 8px 8px',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <span style={{
            width: 24, height: 24, borderRadius: '50%', background: 'var(--cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Grid3x3 size={13} strokeWidth={2.5} />
          </span>
          More
        </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          /* one swipeable line: every chip reachable, none cut in half */
          .explore-langs-row { flex-wrap: nowrap !important; overflow-x: auto; padding: 2px 2px 6px; margin: 0 -2px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
          .explore-langs-row::-webkit-scrollbar { display: none; }
          .explore-langs-row > a { flex-shrink: 0; white-space: nowrap; }
          .explore-langs-row .chip-pin-first { order: -1; }
        }
      `}</style>
    </div>
  );
}
