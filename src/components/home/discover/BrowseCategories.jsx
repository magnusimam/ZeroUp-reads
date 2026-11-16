import React from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_CATEGORIES } from './discoverConfig';

// Category chips — same visual language as ExploreLanguages (colour + icon
// pill, hover lift) so "Explore in your language" and "Browse by category"
// read as one family of controls rather than two different UI patterns.
export default function BrowseCategories() {
  return (
    <div id="browse-categories" style={{ scrollMarginTop: 96 }}>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 14px' }}>
        Browse by category
      </h2>
      {/* Mobile: one swipeable line instead of wrapping to a tall stack (or
          clipping chips); the "View all" chip is pinned to the front (CSS
          order) so it's always the first thing in reach. */}
      <div className="browse-cats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {HOMEPAGE_CATEGORIES.map(({ name, color, icon }) => (
          <Link
            key={name}
            to={`/library?category=${encodeURIComponent(name)}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white', border: `2px solid ${color}22`, color,
              borderRadius: 99, padding: '7px 16px 7px 10px',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', transition: 'transform 200ms ease, background 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = `${color}12`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'white'; }}
          >
            <span aria-hidden="true" style={{ fontSize: 16 }}>{icon}</span>
            {name}
          </Link>
        ))}
        <Link
          to="/library"
          className="chip-pin-first"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--navy)', border: '1px solid #E7DFD0',
            borderRadius: 99, padding: '7px 16px 7px 10px',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 16 }}>🗂️</span>
          View all
        </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          /* one swipeable line: every chip reachable, none cut in half */
          .browse-cats-row { flex-wrap: nowrap !important; overflow-x: auto; padding: 2px 2px 6px; margin: 0 -2px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
          .browse-cats-row::-webkit-scrollbar { display: none; }
          .browse-cats-row > a { flex-shrink: 0; white-space: nowrap; }
          .browse-cats-row .chip-pin-first { order: -1; }
        }
      `}</style>
    </div>
  );
}
