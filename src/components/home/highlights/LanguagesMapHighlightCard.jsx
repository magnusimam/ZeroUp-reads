import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MAP_LANGUAGES } from './highlightsConfig';

const PIN_COLORS = ['var(--navy)', 'var(--amber)', 'var(--green)', 'var(--coral)', 'var(--sky-blue)', 'var(--gold)'];

export default function LanguagesMapHighlightCard() {
  return (
    <div className="home-card-lift" style={{
      background: '#E4EEFC', borderRadius: 20, padding: 28,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 12px' }}>
        Languages Map
      </h3>
      <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.7, color: '#4B5A72', margin: '0 0 14px' }}>
        See the languages we support across Nigeria and Africa.
      </p>
      <Link
        to="/library"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--sky-blue)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', marginBottom: 20,
        }}
      >
        Explore map <ArrowRight size={14} />
      </Link>

      {/* Decorative "map" accent — a scatter of real supported-language pins
          rather than a sourced map illustration asset (see highlightsConfig). */}
      <div aria-hidden="true" style={{
        marginTop: 'auto', borderRadius: 16, background: 'rgba(255,255,255,0.55)',
        padding: '18px 16px', display: 'flex', flexWrap: 'wrap', gap: 8,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 30, width: '100%', textAlign: 'center', marginBottom: 4 }} role="img" aria-label="">🗺️</span>
        {MAP_LANGUAGES.slice(0, 6).map((lang, i) => (
          <span key={lang} style={{
            background: PIN_COLORS[i % PIN_COLORS.length], color: 'white',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
            borderRadius: 99, padding: '4px 10px',
          }}>{lang}</span>
        ))}
      </div>
    </div>
  );
}
