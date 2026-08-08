import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AI_POWERED_COPY } from './aiPoweredConfig';

// Illustration asset: friendly robot reading an open book, sourced from the
// design reference screenshot with its baked-in text painted out (see the
// reference's own "AI-Powered. Human-Guided." copy — reproduced below as
// real, live text rather than pixels, same treatment as LanguagesMapHighlightCard).
const ROBOT_ILLUSTRATION = '/images/ai-powered-robot-illustration.png';

export default function AiPoweredSection() {
  return (
    <section style={{ background: 'var(--cream)', padding: '40px 0 100px' }}>
      <div className="container">
        <div className="ai-powered-row home-card-lift" style={{
          background: 'white', borderRadius: 20, padding: '32px 40px',
          display: 'flex', alignItems: 'center', gap: 32,
          boxShadow: '0 8px 30px rgba(58,26,16,0.08)',
        }}>
          <img
            src={ROBOT_ILLUSTRATION}
            alt="Friendly robot reading an open book, representing ZeroUp Reads' AI-assisted, human-reviewed content pipeline"
            style={{ width: 140, height: 'auto', flexShrink: 0, display: 'block' }}
          />
          <div>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--navy)', margin: '0 0 12px' }}>
              {AI_POWERED_COPY.title}
            </h3>
            <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.7, color: '#4B5A72', margin: '0 0 14px', maxWidth: 640 }}>
              {AI_POWERED_COPY.body}
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
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .ai-powered-row { flex-direction: column; text-align: center; padding: 28px 24px !important; }
        }
      `}</style>
    </section>
  );
}
