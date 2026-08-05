import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { READING_LEVELS } from './discoverConfig';

export default function ReadingLevelPicker() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 14px' }}>
        Pick your reading level
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
      }}>
        {READING_LEVELS.map((lvl, i) => (
          <Link
            key={lvl.key}
            to={`/library?level=${encodeURIComponent(lvl.libraryLevel)}`}
            style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              gap: 8, padding: '22px 20px', borderRadius: 18,
              background: lvl.bg, textDecoration: 'none',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              minHeight: 140,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(31,61,110,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span
              style={{
                fontSize: 36, display: 'inline-block',
                animation: `float ${3.2 + i * 0.4}s ease-in-out ${i * 0.25}s infinite`,
              }}
              aria-hidden="true"
            >{lvl.emoji}</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: lvl.accent }}>
              {lvl.label}
            </span>
            <span style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: lvl.accent, opacity: 0.75 }}>
              {lvl.ageRange}
            </span>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', right: 16, bottom: 16,
                width: 34, height: 34, borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: lvl.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
