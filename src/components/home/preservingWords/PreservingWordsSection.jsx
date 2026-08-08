import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRESERVING_WORDS_COPY } from './preservingWordsConfig';

// Illustration asset: grandmother reading with a child under an acacia tree
// at sunset, sourced from the design reference screenshot with its baked-in
// text painted out (see the reference's own "Preserving More Than Words"
// copy — reproduced below as real, live text rather than pixels, same
// treatment as LanguagesMapHighlightCard / AiPoweredSection).
const PRESERVING_ILLUSTRATION = '/images/preserving-more-than-words-illustration.png';

export default function PreservingWordsSection() {
  return (
    <section style={{ background: 'var(--cream)', padding: '0 0 100px' }}>
      <div className="container">
        <div className="preserving-words-row home-card-lift" style={{
          background: '#FFF8ED', borderRadius: 20, padding: '32px 40px',
          display: 'flex', alignItems: 'center', gap: 32,
          boxShadow: '0 8px 30px rgba(58,26,16,0.08)',
        }}>
          <div>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: '#6B2A14', margin: '0 0 12px' }}>
              {PRESERVING_WORDS_COPY.title}
            </h3>
            <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.7, color: '#4B5A72', margin: '0 0 14px', maxWidth: 640 }}>
              {PRESERVING_WORDS_COPY.body}
            </p>
            <Link
              to="/about"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: 'var(--sky-blue)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Learn more <ArrowRight size={14} />
            </Link>
          </div>
          <img
            src={PRESERVING_ILLUSTRATION}
            alt="Grandmother reading a book with a child under an acacia tree at sunset, representing ZeroUp Reads' mission to preserve African languages and culture"
            style={{ width: 200, height: 'auto', flexShrink: 0, display: 'block', borderRadius: 16, marginLeft: 'auto' }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .preserving-words-row { flex-direction: column-reverse; text-align: center; padding: 28px 24px !important; }
          .preserving-words-row img { margin: 0 auto !important; }
        }
      `}</style>
    </section>
  );
}
