import React from 'react';
import { Link } from 'react-router-dom';
import { READING_LEVELS } from './discoverConfig';

export default function ReadingLevelPicker() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 14px' }}>
        Pick your reading level
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20,
      }}>
        {READING_LEVELS.map((lvl) => (
          <Link
            key={lvl.key}
            to={`/library?level=${encodeURIComponent(lvl.libraryLevel)}`}
            style={{
              position: 'relative', display: 'block', overflow: 'hidden',
              borderRadius: 20, background: lvl.bg, textDecoration: 'none',
              minHeight: 178, transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(31,61,110,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Title block */}
            <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{lvl.icon}</span>
                <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: lvl.accent }}>
                  {lvl.label}
                </span>
              </div>
              <div style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: lvl.accent, opacity: 0.65, marginTop: 4 }}>
                {lvl.ageRange}
              </div>
            </div>

            {/* Illustration band — real cropped artwork (see discoverConfig.js
                comment), not an emoji substitute. Its own arrow icon is baked
                in, so no separate live arrow button is rendered on top. */}
            <img
              src={lvl.illustration}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, top: 68,
                width: '100%', height: 'calc(100% - 68px)',
                objectFit: 'cover', objectPosition: 'top', zIndex: 1,
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
