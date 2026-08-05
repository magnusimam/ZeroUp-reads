import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WHY_EXISTS_COPY } from './highlightsConfig';

export default function WhyExistsHighlightCard() {
  return (
    <div className="home-card-lift" style={{
      background: '#F1EBFB', borderRadius: 20, padding: 28,
      display: 'flex', flexDirection: 'column', height: '100%',
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

      {/* Decorative illustration accent — same low-fidelity emoji/shape
          style used elsewhere on the homepage (HowItWorksSection) rather
          than a sourced illustration asset. */}
      <div aria-hidden="true" style={{
        marginTop: 'auto', borderRadius: 16, background: 'rgba(255,255,255,0.55)',
        padding: '20px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, fontSize: 40,
      }}>
        <span role="img" aria-label="">🧒</span>
        <span style={{ fontSize: 26 }} role="img" aria-label="">📖</span>
        <span role="img" aria-label="">👧</span>
      </div>
    </div>
  );
}
