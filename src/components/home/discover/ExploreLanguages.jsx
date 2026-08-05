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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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
    </div>
  );
}
