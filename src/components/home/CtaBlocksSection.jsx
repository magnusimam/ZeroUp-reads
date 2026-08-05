import React from 'react';
import { Link } from 'react-router-dom';
import { Languages, BookOpen, Heart, ArrowRight } from 'lucide-react';
import { CTA_BLOCKS } from './ctaBlocksConfig';

const ICONS = { languages: Languages, bookOpen: BookOpen, heart: Heart };

export default function CtaBlocksSection() {
  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {CTA_BLOCKS.map((block, blockIdx) => {
          const Icon = ICONS[block.icon];
          return (
            <div
              key={block.key}
              className="home-card-lift"
              style={{
                background: block.bg, color: 'white', position: 'relative', overflow: 'hidden',
                padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              {/* Large illustration accent — floats gently, sits behind the copy */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: -10, right: -10, display: 'flex', gap: 4,
                fontSize: 64, opacity: 0.18, pointerEvents: 'none',
              }}>
                {block.illustration.map((emoji, i) => (
                  <span key={i} style={{
                    animation: `float ${3.4 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                    display: 'inline-block',
                  }}>{emoji}</span>
                ))}
              </div>

              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                animation: `float ${3.2 + blockIdx * 0.3}s ease-in-out ${blockIdx * 0.2}s infinite`,
              }}>
                <Icon size={24} strokeWidth={2.25} />
              </div>
              <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 24, margin: 0 }}>{block.title}</h3>
              <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.6, opacity: 0.9, margin: '0 0 8px', maxWidth: 320 }}>
                {block.body}
              </p>
              <Link
                to={block.ctaTo}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
                  background: 'white', color: block.bg, fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                  borderRadius: 10, padding: '10px 18px', textDecoration: 'none',
                  transition: 'transform 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {block.ctaLabel} <ArrowRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
