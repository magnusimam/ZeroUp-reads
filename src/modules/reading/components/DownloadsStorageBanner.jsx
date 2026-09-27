import React from 'react';
import { Database } from 'lucide-react';

export default function DownloadsStorageBanner({ onManageStorage }) {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-wrap items-center gap-5 p-5 sm:p-6"
      style={{ background: 'linear-gradient(90deg, #FFE9C7 0%, #FFF3E0 100%)' }}
    >
      <div className="flex items-center gap-2 font-handwriting text-lg" style={{ color: 'var(--hero-ink)' }} aria-hidden="true">
        <span className="text-3xl">📖</span> More stories tomorrow! ♥
      </div>

      <div className="flex-1 min-w-[220px] flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0" style={{ color: 'var(--hero-orange)' }} aria-hidden="true">
          <Database size={18} />
        </span>
        <div>
          <p className="font-nunito font-extrabold text-sm" style={{ color: 'var(--hero-ink)' }}>Need more space?</p>
          <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>Manage your downloads, or upgrade your storage for more books.</p>
        </div>
      </div>

      <button
        onClick={onManageStorage}
        className="px-5 py-2.5 rounded-full bg-white font-nunito font-bold text-sm shrink-0 shadow-card hover:opacity-90 transition-opacity"
        style={{ color: 'var(--hero-ink)' }}
      >
        Manage Storage →
      </button>
    </div>
  );
}
