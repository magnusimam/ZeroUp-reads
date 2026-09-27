import React from 'react';

const PERKS = [
  { icon: '🚚', label: 'Fast & Reliable Delivery' },
  { icon: '💰', label: 'Affordable Prices' },
  { icon: '🌍', label: 'Support Local Languages' },
  { icon: '👨‍👩‍👧', label: 'Ideal for Schools & Parents' },
];

const SPINE_WORDS = [
  { word: 'READ', bg: '#E0653A' },
  { word: 'LEARN', bg: '#2D6BE4' },
  { word: 'GROW', bg: '#2F7A26' },
  { word: 'BELONG', bg: '#7A2E1F' },
];

// Printed-book fulfillment doesn't exist yet as a real backend feature — this
// stays the same kind of decorative, not-wired-to-anything CTA the previous
// "Bring the Magic Home" version already was; only the visual language changes.
export default function OrderCTA() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-10">
      <div className="relative overflow-hidden rounded-[32px] min-h-[320px] sm:min-h-[300px] flex items-center">
        <img
          src="/images/order-a-book-illustration.jpg"
          alt="A child happily reading a printed ZeroUp Reads book beside a stack of storybooks"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '72% center' }}
        />
        {/* Left-side scrim — the photo's own forest backdrop is light enough,
            this just keeps the text reliably legible over it at every width. */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, #FFE9C7 0%, rgba(255,233,199,0.85) 38%, rgba(255,233,199,0.15) 62%, rgba(255,233,199,0) 78%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 px-8 py-10 sm:py-12 max-w-md">
          <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl drop-shadow-sm" style={{ color: 'var(--hero-ink)' }}>
            Order a Book for Your Child
          </h2>
          <p className="font-nunito-sans mt-3 text-sm sm:text-base leading-relaxed drop-shadow-sm" style={{ color: 'var(--hero-ink)', opacity: 0.8 }}>
            Get beautifully printed copies of selected ZeroUp Reads books delivered to your home, school, or community.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6">
            {PERKS.map(p => (
              <div key={p.label} className="flex items-center gap-2 text-sm font-nunito font-bold" style={{ color: 'var(--hero-ink)' }}>
                <span aria-hidden="true">{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          <button
            className="mt-8 px-8 py-3.5 rounded-full text-white font-nunito font-extrabold text-sm hover:scale-105 transition-transform shadow-card"
            style={{ background: 'var(--hero-green)' }}
          >
            Order a Book →
          </button>
        </div>

        <div
          className="hidden md:block absolute top-6 right-24 lg:right-32 px-3 py-2 rounded-2xl rounded-br-sm text-xs font-nunito font-extrabold text-white shadow-card max-w-[110px] z-10"
          style={{ background: 'var(--hero-orange)' }}
        >
          Real books.<br />Brighter futures.
        </div>

        <div className="hidden lg:flex flex-col gap-1.5 absolute right-5 top-1/2 -translate-y-1/2 z-10">
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
      </div>
    </section>
  );
}
