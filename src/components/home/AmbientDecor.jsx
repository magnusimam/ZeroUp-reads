import React from 'react';

// Reusable "magic dust" layer for the plain-CSS half of the homepage (the
// hero's own FloatingDecor.tsx already covers the Tailwind/framer-motion
// half) — a pool of small emoji decorations, each with its own drift/twinkle
// animation from index.css, absolutely positioned over whichever section
// renders this. Kept data-driven (one POOL, sliced per call) so every section
// that wants "delightful motion" doesn't hand-roll its own scattered spans.
const POOL = [
  { emoji: '🍃', top: '8%', left: '4%', size: 22, anim: 'leafDrift 5.5s ease-in-out infinite' },
  { emoji: '🦋', top: '72%', left: '3%', size: 24, anim: 'butterflyFlutter 4.2s ease-in-out infinite' },
  { emoji: '🐦', top: '14%', left: '92%', size: 22, anim: 'birdFly 6.5s ease-in-out infinite' },
  { emoji: '✈️', top: '80%', left: '88%', size: 22, anim: 'paperPlaneFly 5s ease-in-out infinite' },
  { emoji: '✨', top: '22%', left: '50%', size: 16, anim: 'twinkleStar 2.8s ease-in-out infinite' },
  { emoji: '⭐', top: '4%', left: '30%', size: 14, anim: 'twinkleStar 3.4s ease-in-out infinite 0.4s' },
  { emoji: '☁️', top: '6%', left: '68%', size: 40, anim: 'cloudDrift 9s ease-in-out infinite' },
  { emoji: '🍃', top: '90%', left: '46%', size: 18, anim: 'leafDrift 4.8s ease-in-out infinite 0.6s' },
  { emoji: '⭐', top: '55%', left: '96%', size: 12, anim: 'twinkleStar 3s ease-in-out infinite 0.8s' },
  { emoji: '☁️', top: '85%', left: '10%', size: 30, anim: 'cloudDrift 11s ease-in-out infinite 1s' },
  { emoji: '🦋', top: '30%', left: '8%', size: 18, anim: 'butterflyFlutter 3.6s ease-in-out infinite 0.3s' },
  { emoji: '✨', top: '68%', left: '60%', size: 14, anim: 'twinkleStar 2.4s ease-in-out infinite 1.1s' },
];

/**
 * @param {number} count how many pool items to show (default: all)
 * @param {number} offset rotate the starting point in the pool so two
 *   sections placed back-to-back don't render an identical scatter
 */
export default function AmbientDecor({ count = POOL.length, offset = 0 }) {
  const items = Array.from({ length: Math.min(count, POOL.length) }, (_, i) => POOL[(i + offset) % POOL.length]);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {items.map((item, i) => (
        <span
          key={i}
          className="ambient-decor-item"
          style={{
            position: 'absolute', top: item.top, left: item.left,
            fontSize: item.size, lineHeight: 1, animation: item.anim,
            opacity: 0.85,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
