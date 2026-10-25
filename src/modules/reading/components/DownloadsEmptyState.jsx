import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DownloadsEmptyState() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[#E3EEFA] flex flex-col items-center justify-center text-center py-8 px-6 min-h-[270px]"
      style={{ background: '#EEF7FE' }}
    >
      {/* soft clouds, as in the design */}
      <span className="absolute -left-10 top-16 w-48 h-16 rounded-full bg-white/60 blur-md" aria-hidden="true" />
      <span className="absolute right-8 top-6 w-40 h-12 rounded-full bg-white/60 blur-md" aria-hidden="true" />

      <img
        src="/images/downloads/downloads-empty-box.png"
        alt=""
        aria-hidden="true"
        className="relative w-40 h-auto"
      />
      <h3 className="relative font-nunito font-extrabold text-[22px] mt-1" style={{ color: '#0B1F4D' }}>No downloads yet!</h3>
      <p className="relative font-nunito-sans text-sm mt-2" style={{ color: '#3B4660' }}>
        Books you download will appear here so you can read them offline.
      </p>
      <Link
        to="/library"
        className="relative mt-5 inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full text-white font-nunito font-extrabold text-[15px] shadow-[0_8px_18px_rgba(5,167,91,0.30)] hover:brightness-105 transition"
        style={{ background: '#05A75B' }}
      >
        Explore Books <ArrowRight size={18} />
      </Link>
    </div>
  );
}
