import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TIPS = [
  'Find a book you like',
  'Click the download button',
  'Access it anytime from this page',
  'Save audio stories for listening offline',
  'Manage your storage easily',
];

export default function OfflineTipsCard() {
  return (
    <div className="rounded-3xl p-6 flex flex-col gap-4 h-full" style={{ background: '#EAF7EF' }}>
      <h3 className="flex items-center gap-2 font-nunito font-extrabold text-base" style={{ color: 'var(--hero-ink)' }}>
        <span aria-hidden="true">💡</span> Tips for Offline Reading
      </h3>

      <ul className="flex flex-col gap-2.5">
        {TIPS.map(tip => (
          <li key={tip} className="flex items-start gap-2 font-nunito-sans text-sm" style={{ color: 'var(--hero-ink)' }}>
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--hero-green)' }} />
            {tip}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2 flex items-end justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">📚</span>
        <p className="font-handwriting text-lg leading-tight text-right" style={{ color: 'var(--hero-ink)' }}>
          Learn<br />anywhere! ♥
        </p>
      </div>
    </div>
  );
}
