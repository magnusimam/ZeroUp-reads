import React from 'react';
import { Database, ArrowRight } from 'lucide-react';

export default function DownloadsStorageBanner({ onManageStorage }) {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col md:flex-row md:items-center"
      style={{ background: 'linear-gradient(90deg, #FEF2D8 0%, #FEF5D8 100%)' }}
    >
      {/* Girl-reading + "More stories tomorrow!" note, from the design mockup. */}
      <img
        src="/images/downloads/downloads-banner-girl.jpg"
        alt=""
        aria-hidden="true"
        className="w-full md:w-auto md:h-[112px] object-cover object-left shrink-0"
      />

      <div className="flex-1 flex flex-wrap items-center gap-4 m-3 md:my-3 md:mr-5 md:ml-2 rounded-2xl px-5 py-4" style={{ background: '#FFF8E7' }}>
        <span
          className="w-12 h-12 rounded-2xl bg-white border border-[#E6ECF5] flex items-center justify-center shrink-0 shadow-sm"
          style={{ color: '#1466E6' }}
          aria-hidden="true"
        >
          <Database size={24} />
        </span>
        <div className="flex-1 min-w-[200px]">
          <p className="font-nunito font-extrabold text-base" style={{ color: '#0B1F4D' }}>Need more space?</p>
          <p className="font-nunito-sans text-sm" style={{ color: '#3B4660' }}>Manage your downloads, or upgrade your storage for more books.</p>
        </div>
        <button
          onClick={onManageStorage}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white font-nunito font-extrabold text-sm shrink-0 shadow-[0_4px_12px_rgba(16,40,90,0.12)] hover:-translate-y-0.5 transition"
          style={{ color: '#0B1F4D' }}
        >
          Manage Storage <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
