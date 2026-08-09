import React from 'react';
import { computeGenreGradient } from '../genreBreakdown';

export default function TopGenresChart({ genreBreakdown }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--hero-border)', borderRadius: 20, padding: '18px 20px' }}>
      <h2 style={{ margin: '0 0 16px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--hero-ink)' }}>Top Genres</h2>

      {genreBreakdown.length === 0 ? (
        <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>
          Start a story to see your genre mix here.
        </p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: computeGenreGradient(genreBreakdown) }} />
            <div style={{
              position: 'absolute', inset: 16, borderRadius: '50%', background: 'white',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
            {genreBreakdown.map((slice) => (
              <div key={slice.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito Sans', fontSize: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: slice.color, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ color: 'var(--hero-ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slice.label}</span>
                <span style={{ color: 'var(--hero-gray)', fontWeight: 700 }}>{slice.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
