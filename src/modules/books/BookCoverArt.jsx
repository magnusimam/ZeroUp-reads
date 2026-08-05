import React from 'react';

// Illustrated cover treatment shared by every book-facing surface (BookCard's
// portrait variant, carousel, testimonial thumbnails, educational cards) so a
// book's visual identity is defined once, by category, instead of per-screen.
const THEMES = {
  Storybooks: {
    // purple-to-midnight
    gradient: 'radial-gradient(120% 100% at 50% 0%, #6B2FA0 0%, #3B1E6E 45%, #150A2E 100%)',
    glow: 'rgba(212,175,55,0.35)',
    icon: (
      <path d="M50 26 C40 18 22 18 14 24 V72 C22 66 40 66 50 74 C60 66 78 66 86 72 V24 C78 18 60 18 50 26 Z M50 26 L50 74" />
    ),
  },
  Science: {
    // teal-to-navy
    gradient: 'radial-gradient(120% 100% at 50% 0%, #1F8A82 0%, #0E4C5C 45%, #071B2E 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <ellipse cx="50" cy="50" rx="40" ry="16" />
        <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(120 50 50)" />
        <circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  Technology: {
    // electric blue-to-navy
    gradient: 'radial-gradient(120% 100% at 50% 0%, #2E6FE0 0%, #16336B 45%, #060B1E 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <rect x="30" y="30" width="40" height="40" rx="4" />
        <circle cx="50" cy="50" r="9" />
        <line x1="50" y1="8" x2="50" y2="30" />
        <line x1="50" y1="70" x2="50" y2="92" />
        <line x1="8" y1="50" x2="30" y2="50" />
        <line x1="70" y1="50" x2="92" y2="50" />
      </>
    ),
  },
  History: {
    // amber-to-brown
    gradient: 'radial-gradient(120% 100% at 50% 0%, #A9762F 0%, #5C3A1A 45%, #1E1207 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <rect x="22" y="18" width="56" height="64" rx="6" />
        <line x1="32" y1="34" x2="68" y2="34" />
        <line x1="32" y1="46" x2="68" y2="46" />
        <line x1="32" y1="58" x2="54" y2="58" />
      </>
    ),
  },
  Mathematics: {
    // crimson-to-plum
    gradient: 'radial-gradient(120% 100% at 50% 0%, #A0304F 0%, #5C1E38 45%, #200B16 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <path d="M50 15 L85 80 L15 80 Z" />
        <circle cx="50" cy="55" r="14" />
      </>
    ),
  },
  Health: {
    // green-to-forest
    gradient: 'radial-gradient(120% 100% at 50% 0%, #3D8A4E 0%, #1F5C33 45%, #0E2A1B 100%)',
    glow: 'rgba(212,175,55,0.32)',
    icon: (
      <path d="M50 84 C18 60 8 40 8 24 C8 9 24 3 34 14 C41 21 50 31 50 31 C50 31 59 21 66 14 C76 3 92 9 92 24 C92 40 82 60 50 84 Z" />
    ),
  },
  Arts: {
    gradient: 'radial-gradient(120% 100% at 50% 0%, #A0349E 0%, #5B1E70 45%, #1E0A2E 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <circle cx="50" cy="50" r="35" />
        <circle cx="34" cy="34" r="6" fill="currentColor" stroke="none" />
        <circle cx="66" cy="34" r="6" fill="currentColor" stroke="none" />
        <circle cx="28" cy="60" r="6" fill="currentColor" stroke="none" />
        <circle cx="70" cy="62" r="6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  'Language & Culture': {
    // terracotta-to-earth
    gradient: 'radial-gradient(120% 100% at 50% 0%, #C06B3A 0%, #7A3D1F 45%, #2A140A 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <circle cx="50" cy="50" r="35" />
        <ellipse cx="50" cy="50" rx="15" ry="35" />
        <line x1="15" y1="50" x2="85" y2="50" />
      </>
    ),
  },
  AI: {
    // violet-to-ink, echoes Technology's circuit motif with a neural-net twist
    gradient: 'radial-gradient(120% 100% at 50% 0%, #7C3AED 0%, #3E1E7A 45%, #140A2E 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <circle cx="50" cy="30" r="7" />
        <circle cx="26" cy="60" r="7" />
        <circle cx="74" cy="60" r="7" />
        <circle cx="50" cy="82" r="7" />
        <line x1="50" y1="30" x2="26" y2="60" />
        <line x1="50" y1="30" x2="74" y2="60" />
        <line x1="26" y1="60" x2="50" y2="82" />
        <line x1="74" y1="60" x2="50" y2="82" />
        <line x1="26" y1="60" x2="74" y2="60" />
      </>
    ),
  },
  Space: {
    // midnight-to-violet with a ringed planet
    gradient: 'radial-gradient(120% 100% at 50% 0%, #1E2A6E 0%, #101542 45%, #05061A 100%)',
    glow: 'rgba(212,175,55,0.32)',
    icon: (
      <>
        <circle cx="50" cy="50" r="22" />
        <ellipse cx="50" cy="50" rx="42" ry="10" transform="rotate(-18 50 50)" />
      </>
    ),
  },
  Agriculture: {
    // olive-to-earth with a sprouting leaf
    gradient: 'radial-gradient(120% 100% at 50% 0%, #4E7A2F 0%, #2C4A18 45%, #101E08 100%)',
    glow: 'rgba(212,175,55,0.28)',
    icon: (
      <path d="M50 90 V40 C50 25 62 15 78 15 C78 32 66 40 50 40 C50 25 38 15 22 15 C22 32 34 40 50 40" />
    ),
  },
  Finance: {
    // deep gold-to-navy with a coin motif
    gradient: 'radial-gradient(120% 100% at 50% 0%, #B8862E 0%, #5C4114 45%, #1C1204 100%)',
    glow: 'rgba(212,175,55,0.38)',
    icon: (
      <>
        <circle cx="50" cy="50" r="34" />
        <path d="M50 32 V68 M40 40 C40 34 44 32 50 32 C58 32 62 36 62 41 C62 46 58 48 50 50 C42 52 38 54 38 59 C38 64 42 68 50 68 C56 68 60 66 60 60" />
      </>
    ),
  },
  Culture: {
    // terracotta-to-earth, distinct pattern motif from Language & Culture
    gradient: 'radial-gradient(120% 100% at 50% 0%, #C0863A 0%, #7A4D1F 45%, #2A1A0A 100%)',
    glow: 'rgba(212,175,55,0.30)',
    icon: (
      <>
        <path d="M20 75 L35 30 L50 75 Z" />
        <path d="M50 75 L65 30 L80 75 Z" />
        <line x1="15" y1="80" x2="85" y2="80" />
      </>
    ),
  },
  Adventure: {
    // sunset coral-to-navy with a compass motif
    gradient: 'radial-gradient(120% 100% at 50% 0%, #E0653A 0%, #7A2E1F 45%, #240D06 100%)',
    glow: 'rgba(212,175,55,0.32)',
    icon: (
      <>
        <circle cx="50" cy="50" r="36" />
        <path d="M50 24 L58 50 L50 76 L42 50 Z" />
      </>
    ),
  },
  Animals: {
    // warm brown-to-forest with a paw motif
    gradient: 'radial-gradient(120% 100% at 50% 0%, #8A5A2F 0%, #4C3318 45%, #1A1108 100%)',
    glow: 'rgba(212,175,55,0.28)',
    icon: (
      <>
        <circle cx="50" cy="58" r="18" />
        <circle cx="30" cy="38" r="9" />
        <circle cx="70" cy="38" r="9" />
        <circle cx="42" cy="26" r="7" />
        <circle cx="58" cy="26" r="7" />
      </>
    ),
  },
  Environment: {
    // teal-to-forest with a leaf/droplet motif
    gradient: 'radial-gradient(120% 100% at 50% 0%, #2F8A6E 0%, #185C48 45%, #082A20 100%)',
    glow: 'rgba(212,175,55,0.28)',
    icon: (
      <path d="M50 15 C70 35 78 52 78 65 C78 79 65 88 50 88 C35 88 22 79 22 65 C22 52 30 35 50 15 Z" />
    ),
  },
};

const DEFAULT_THEME = {
  gradient: 'radial-gradient(120% 100% at 50% 0%, #4A4A5A 0%, #26262F 45%, #0F0F14 100%)',
  glow: 'rgba(212,175,55,0.25)',
  icon: <circle cx="50" cy="50" r="30" />,
};

export default function BookCoverArt({ category, className = '', style = {} }) {
  const theme = THEMES[category] || DEFAULT_THEME;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: theme.gradient,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Decorative watermark motif — line-art, not a flat emoji sticker */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          width: '85%',
          height: '85%',
          transform: 'translateX(-50%) rotate(-8deg)',
          color: 'rgba(255,255,255,0.14)',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.5,
        }}
        aria-hidden="true"
      >
        {theme.icon}
      </svg>

      {/* Illustrated paper/fabric grain — fine diagonal hatching so the cover reads
          as textured artwork instead of a flat digital gradient. */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 9px)',
        opacity: 0.6,
      }} />

      {/* Top sheen */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)',
      }} />

      {/* Gold ambient glow, bottom-left */}
      <div style={{
        position: 'absolute', width: '70%', height: '50%', left: '-15%', bottom: '-15%',
        background: `radial-gradient(circle, ${theme.glow} 0%, rgba(0,0,0,0) 70%)`,
        filter: 'blur(2px)',
      }} />

      {/* Bottom vignette for badge/text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(0deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0) 45%)',
      }} />
    </div>
  );
}
