import React from 'react';
import { Link } from 'react-router-dom';

// Each card routes to the real page for that capability — "Listen as You
// Read" has no audio feature built yet (no audioUrl anywhere in the book
// data), so it stays informational instead of linking to something that
// doesn't exist.
const FEATURES = [
  { icon: '📶', label: 'Read Online or Offline', desc: 'Take your favourite stories anywhere, anytime.', bg: '#F1E9FF', color: '#6C5FBC', to: '/offline' },
  { icon: '🎧', label: 'Listen as You Read', desc: 'Audio support — coming soon.', bg: '#E8F2FF', color: '#2D6BE4', to: null },
  { icon: '🌍', label: 'Translate with AI', desc: 'Request any book in your language.', bg: '#E7F9EF', color: '#2F7A26', to: '/help' },
  { icon: '🤝', label: 'Help Us Grow', desc: 'Suggest stories, volunteer, or partner with us.', bg: '#FFE9E4', color: '#FF6B6B', to: '/about' },
];

function Card({ f }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: f.bg }}
    >
      <span className="text-2xl" aria-hidden="true">{f.icon}</span>
      <p className="font-nunito font-extrabold text-sm mt-2" style={{ color: f.color }}>{f.label}</p>
      <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>{f.desc}</p>
    </div>
  );
}

export default function LibraryFeatureHighlights() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(f => (
          f.to ? (
            <Link key={f.label} to={f.to} className="hover:-translate-y-0.5 transition-transform">
              <Card f={f} />
            </Link>
          ) : (
            <div key={f.label}>
              <Card f={f} />
            </div>
          )
        ))}
      </div>
    </section>
  );
}
