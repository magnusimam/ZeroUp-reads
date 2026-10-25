import React from 'react';

// Header illustration: girl reading under a tree, with the "Readers brighter
// tomorrow" note, the bird and the Read/Learn/Grow/Belong book stack all
// painted into the picture. On lg+ it's right-aligned at 78% width so that
// baked-in note lands mid-hero as in the design instead of under the title;
// below lg there isn't room for both, so the picture is drawn wider than the
// screen (anchored right) and the note slides off the left edge. Its left
// edge is masked into a sky-to-meadow gradient matching its colours.
export default function ProfileHero() {
  return (
    <section
      className="relative w-full overflow-hidden h-[240px] sm:h-[280px] lg:h-[320px]"
      style={{ background: 'linear-gradient(180deg, #D3E6F8 0%, #EAF2EC 55%, #DFE8C9 100%)' }}
    >
      <img
        src="/images/profile/profile-hero-reader.jpg"
        alt="A smiling girl reading under a tree beside a stack of books labelled Read, Learn, Grow and Belong"
        className="absolute inset-y-0 right-0 h-full w-[160%] lg:w-[78%] max-w-none object-cover object-top lg:object-center"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 18%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 18%)',
        }}
      />
      {/* Phones: the title sits over the picture (it's drawn wider than the
          screen below lg), so a soft wash behind the left side keeps it readable. */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.2) 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0) 50%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-content mx-auto w-full px-4 sm:px-6">
          <h1 className="font-nunito font-extrabold text-4xl sm:text-5xl drop-shadow-sm" style={{ color: 'var(--navy)' }}>
            My Profile
          </h1>
          <p className="font-nunito-sans mt-2 text-base drop-shadow-sm" style={{ color: 'var(--hero-ink)' }}>
            Your reading journey, all in one place.
          </p>
        </div>
      </div>
    </section>
  );
}
