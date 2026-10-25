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
    <div
      className="rounded-3xl border border-[#E3EAF6] px-6 pt-5 flex flex-col gap-4 h-full overflow-hidden"
      style={{ background: '#F5F8FF' }}
    >
      <h3 className="flex items-center gap-2 font-nunito font-extrabold text-lg" style={{ color: '#0B1F4D' }}>
        <span className="text-2xl" aria-hidden="true">💡</span> Tips for Offline Reading
      </h3>

      <ul className="flex flex-col gap-2.5">
        {TIPS.map(tip => (
          <li key={tip} className="flex items-center gap-2.5 font-nunito-sans text-sm" style={{ color: '#2D3748' }}>
            <CheckCircle2 size={19} className="shrink-0" fill="#05A75B" color="#fff" />
            {tip}
          </li>
        ))}
      </ul>

      {/* Book stack + plant + "Learn anywhere!" note, from the design mockup. */}
      <img
        src="/images/downloads/downloads-tips-books.jpg"
        alt=""
        aria-hidden="true"
        className="mt-auto -mx-6 w-[calc(100%+3rem)] max-w-none h-auto"
      />
    </div>
  );
}
