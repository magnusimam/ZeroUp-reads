import React from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_CATEGORIES } from './discoverConfig';

// Category chips — same visual language as ExploreLanguages (colour + icon
// pill, hover lift) so "Explore in your language" and "Browse by category"
// read as one family of controls rather than two different UI patterns.
export default function BrowseCategories() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 14px' }}>
        Browse by category
      </h2>
      {/* Mobile: clipped to 2 rows (max-height + overflow hidden) instead of
          wrapping to a tall stack of lines; the "View all" chip is pinned to
          the front on mobile (CSS order) so it always stays reachable even
          though most category chips get clipped below the fold. */}
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
          .browse-cats-row { max-height: 88px; overflow: hidden; }
          .browse-cats-row .chip-pin-first { order: -1; }
        }
      `}</style>
    </div>
  );
}
