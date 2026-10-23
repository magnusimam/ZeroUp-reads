import React from 'react';

const SPINE_WORDS = [
  { word: 'READ', bg: '#E0653A' },
  { word: 'LEARN', bg: '#2D6BE4' },
  { word: 'GROW', bg: '#2F7A26' },
  { word: 'BELONG', bg: '#7A2E1F' },
];

// Reuses the Library page's hero photo — no dedicated "profile" illustration
// has been supplied, and this keeps the same reading-under-the-tree scene as
// a stand-in rather than a mismatched placeholder.
export default function ProfileHero() {
  return (
    <section className="relative w-full overflow-hidden h-[240px] sm:h-[280px] lg:h-[300px]">
      <img
        src="/images/library-hero-reading.jpg"
        alt="A child reading under a tree beside a friendly robot, with a village in the distance"
        className="absolute inset-0 w-full h-full object-cover object-right sm:object-[62%_center]"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 34%, rgba(255,255,255,0) 60%)' }}
        aria-hidden="true"
      />

      <div
        className="hidden sm:block absolute left-[34%] top-6 font-handwriting text-xl sm:text-2xl leading-tight"
        style={{ color: 'var(--navy)', transform: 'rotate(-6deg)' }}
        aria-hidden="true"
      >
        Readers build<br />brighter tomorrows! <span style={{ color: 'var(--coral, #FF6B6B)' }}>♥</span>
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-content mx-auto w-full px-4 sm:px-6">
          <h1 className="font-nunito font-extrabold text-4xl sm:text-5xl drop-shadow-sm" style={{ color: 'var(--navy)' }}>
            My Profile
          </h1>
          <p className="font-nunito-sans mt-2 text-base drop-shadow-sm" style={{ color: 'var(--hero-gray)' }}>
            Your reading journey, all in one place.
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-1.5 absolute right-4 lg:right-8 top-1/2 -translate-y-1/2">
        {SPINE_WORDS.map(s => (
          <span
            key={s.word}
            className="font-nunito font-extrabold text-xs text-center px-3 py-1.5 rounded shadow"
            style={{ background: s.bg, color: '#FFF3E0', letterSpacing: '0.04em' }}
          >
            {s.word}
          </span>
        ))}
      </div>
    </section>
  );
}
