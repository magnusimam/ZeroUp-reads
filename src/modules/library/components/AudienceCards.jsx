import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CARDS = [
  { to: '/parents-teachers', icon: '👪', title: 'For Parents', text: 'Bedtime stories & values to read together', bg: '#FFF4E6', border: '#F8E3C8', accent: 'var(--hero-orange)' },
  { to: '/parents-teachers?tab=teachers', icon: '🍎', title: 'For Teachers', text: 'Books by subject & level for your classroom', bg: '#EEF8F1', border: '#D3EDDC', accent: 'var(--hero-green)' },
];

// Two small entry cards on the Library page → the Parents & Teachers page.
export default function AudienceCards() {
  return (
    <div className="max-w-content mx-auto w-full px-4 sm:px-6 pt-8 grid sm:grid-cols-2 gap-4">
      {CARDS.map(c => (
        <Link
          key={c.title}
          to={c.to}
          className="group flex items-center gap-4 rounded-2xl px-5 py-4 border hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,40,90,0.10)] transition"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm" aria-hidden="true">{c.icon}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-nunito font-extrabold text-base" style={{ color: 'var(--hero-ink)' }}>{c.title}</span>
            <span className="block font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>{c.text}</span>
          </span>
          <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: c.accent }} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
