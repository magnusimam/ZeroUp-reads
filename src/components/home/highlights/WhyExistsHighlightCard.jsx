import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WHY_EXISTS_COPY } from './highlightsConfig';

// Illustration asset: two children reading a book together, sourced from the
// design reference screenshot with its baked-in text painted out (see the
// reference's own "Why ZeroUp Reads Exists" / "Learn more" copy — reproduced
// below as real, live text rather than pixels, same treatment as
// LanguagesMapHighlightCard). Replaces the old decorative emoji placeholder.
const WHY_EXISTS_ILLUSTRATION = '/images/why-exists-illustration.png';

export default function WhyExistsHighlightCard() {
  return (
    <div className="home-card-lift" style={{
      background: '#F1EBFB', borderRadius: 20, padding: 28,
      display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden',
    }}>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 12px' }}>
        {WHY_EXISTS_COPY.title}
      </h3>
      <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.7, color: '#5B5568', margin: '0 0 14px' }}>
        {WHY_EXISTS_COPY.body}
      </p>
      <Link
        to="/about"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#7C3AED', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', marginBottom: 20,
        }}
      >
        Learn more <ArrowRight size={14} />
      </Link>

      {/* Real illustration (two children reading a book together), not a
          decorative emoji/shape substitute — matches the LanguagesMapHighlightCard
          treatment in the sibling card. */}
      <img
        src={WHY_EXISTS_ILLUSTRATION}
        alt="Two children sitting together outdoors, reading a book and smiling"
        style={{
          marginTop: 'auto', width: '100%', aspectRatio: '212 / 98',
          objectFit: 'cover', objectPosition: 'center',
          borderRadius: 16, display: 'block',
        }}
      />
    </div>
  );
}
