import React from 'react';
import { Languages, PlayCircle } from 'lucide-react';

// Placeholder art: reuses the Library's reading-under-the-tree illustration
// until a dedicated Translate page design is supplied — swap the src below.
const HERO_IMAGE = '/images/library-hero-reading.jpg';

export default function TranslateHero({ onStart, onLearn }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #D6E8F8 0%, #EEF4EA 60%, #E3EBCF 100%)' }}
    >
      <img
        src={HERO_IMAGE}
        alt="A child reading a book under a tree beside a friendly robot"
        className="absolute inset-y-0 right-0 h-full w-full lg:w-[62%] max-w-none object-cover object-[70%_center]"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 22%)',
        }}
      />
      {/* Phones: the text spans the full width over the picture, so an even
          wash keeps it readable; wide screens: fade only behind the text column. */}
      <div className="absolute inset-0 lg:hidden" style={{ background: 'rgba(255,255,255,0.84)' }} aria-hidden="true" />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 65%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-content mx-auto w-full px-4 sm:px-6 py-12 lg:py-0 lg:h-[360px] flex items-center">
        <div className="max-w-xl">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-nunito font-extrabold mb-4"
            style={{ background: 'rgba(242,106,27,0.12)', color: 'var(--hero-orange)' }}
          >
            <Languages size={14} /> Translate a Story
          </span>
          <h1 className="font-nunito font-extrabold text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--navy)' }}>
            Read any story in <span style={{ color: 'var(--hero-orange)' }}>your language</span>
          </h1>
          <p className="font-nunito-sans text-base sm:text-lg mt-3 leading-relaxed" style={{ color: 'var(--hero-ink)' }}>
            Children understand a story best in the language they speak at home. Pick a book, choose
            Hausa, Yoruba, Igbo, Swahili or another language, and start reading it in moments.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 px-7 h-12 rounded-full text-white font-nunito font-extrabold text-[15px] shadow-[0_8px_20px_rgba(47,122,38,0.30)] hover:scale-[1.03] transition"
              style={{ background: 'var(--hero-green)' }}
            >
              <Languages size={18} /> Translate a Story
            </button>
            <button
              type="button"
              onClick={onLearn}
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-white font-nunito font-extrabold text-[15px] border-2 hover:scale-[1.03] transition"
              style={{ color: 'var(--hero-orange)', borderColor: 'var(--hero-orange)' }}
            >
              <PlayCircle size={18} /> Learn How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
