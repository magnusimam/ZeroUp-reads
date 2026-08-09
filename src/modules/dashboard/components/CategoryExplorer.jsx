import React from 'react';
import { Link } from 'react-router-dom';
import BookCoverArt from '../../books/BookCoverArt';
import { DASHBOARD_CATEGORIES } from '../dashboardConfig';

export default function CategoryExplorer() {
  return (
    <section id="categories">
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--hero-ink)', margin: '0 0 14px' }}>
        Explore by Category
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {DASHBOARD_CATEGORIES.map((tile) => (
          <Link
            key={tile.label}
            to={`/library?category=${encodeURIComponent(tile.category)}`}
            aria-label={`Browse ${tile.label}`}
            style={{
              position: 'relative', display: 'block', borderRadius: 20,
              overflow: 'hidden', aspectRatio: '1 / 1.05', textDecoration: 'none',
              transition: 'transform 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <BookCoverArt category={tile.category} style={{ position: 'absolute', inset: 0 }} />

            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
              <span style={{ fontSize: 20 }} aria-hidden="true">{tile.icon}</span>
              <h3 style={{
                margin: '4px 0 0', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'white',
                lineHeight: 1.2,
              }}>{tile.label}</h3>
            </div>

            <span style={{
              position: 'absolute', right: 10, bottom: 10,
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)', color: tile.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800,
            }}>›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
