import React from 'react';

export default function OrderCTA() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-[#FFF3D6] to-white px-6 py-14 sm:py-16 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <h2 className="relative font-playfair font-extrabold text-2xl sm:text-4xl text-cocoa mb-4">
          Bring the Magic Home
        </h2>
        <p className="relative font-nunito-sans text-charcoal/60 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          Physical book bundles, curated by age and reading level, delivered straight to your door —
          so the stories your kids love on screen can live on their shelf too.
        </p>
        <button className="relative px-10 py-4 rounded-full bg-gold text-ink font-nunito font-extrabold text-base hover:opacity-90 hover:scale-[1.02] transition-all">
          Order for your kids
        </button>
      </div>
    </section>
  );
}
