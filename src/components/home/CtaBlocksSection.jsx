import React from 'react';
import { Link } from 'react-router-dom';
import { Languages, BookOpen, Heart, ArrowRight } from 'lucide-react';
import { CTA_BLOCKS } from './ctaBlocksConfig';

const ICONS = { languages: Languages, bookOpen: BookOpen, heart: Heart };

// Scatter positions for each block's decorative accent glyphs — small and
// spread out (screenshot-matched) rather than one oversized cluster stacked
// in a single corner.
const ACCENT_SPOTS = [
  { top: '12%', left: '82%', size: 20 },
  { top: '68%', left: '6%', size: 16 },
  { top: '78%', left: '90%', size: 22 },
];

export default function CtaBlocksSection() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-6">
      <div
        className="rounded-3xl overflow-hidden shadow-card"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
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
              {/* Small scattered accent glyphs — decorative, sit behind the copy */}
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {block.illustration.map((emoji, i) => {
                  const spot = ACCENT_SPOTS[i % ACCENT_SPOTS.length];
                  return (
                    <span key={i} style={{
                      position: 'absolute', top: spot.top, left: spot.left,
                      fontSize: spot.size, opacity: 0.3,
                      animation: `float ${3.4 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                      display: 'inline-block',
                    }}>{emoji}</span>
                  );
                })}
              </div>

              <div style={{
                width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
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
                  borderRadius: 999, padding: '10px 20px', textDecoration: 'none',
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
