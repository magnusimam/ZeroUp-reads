import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

export default function DownloadsEmptyState() {
  return (
    <div
      className="rounded-3xl flex flex-col items-center justify-center text-center py-16 px-6"
      style={{ background: 'linear-gradient(180deg, #EAF2FF 0%, #F5F9FF 100%)' }}
    >
      <span className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-card mb-4" style={{ color: 'var(--sky-blue, #2D6BE4)' }} aria-hidden="true">
        <PackageOpen size={30} />
      </span>
      <h3 className="font-nunito font-extrabold text-xl" style={{ color: 'var(--hero-ink)' }}>No downloads yet!</h3>
      <p className="font-nunito-sans text-sm mt-2 max-w-sm" style={{ color: 'var(--hero-gray)' }}>
        Books you download will appear here so you can read them offline.
      </p>
      <Link
        to="/library"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-nunito font-bold text-sm hover:opacity-90 transition-opacity"
        style={{ background: 'var(--hero-green)' }}
      >
        Explore Books →
      </Link>
    </div>
  );
}
