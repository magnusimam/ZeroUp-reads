import React from 'react';
import AmbientDecor from '../../../components/home/AmbientDecor';

export default function OrderCTA() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="rounded-[32px] border-2 border-gold/40 bg-gradient-to-br from-[#FFF3D6] via-white to-[#FFEAF0] px-6 py-14 sm:py-16 text-center relative overflow-hidden shadow-card">
        <AmbientDecor count={5} offset={1} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <h2 className="relative font-playfair font-extrabold text-2xl sm:text-4xl text-cocoa mb-4">
          <span className="inline-block animate-[float_3s_ease-in-out_infinite]" aria-hidden="true">🎁</span>{' '}
          Bring the Magic Home{' '}
          <span className="inline-block animate-[float_3s_ease-in-out_infinite_0.3s]" aria-hidden="true">🎨</span>
        </h2>
        <p className="relative font-nunito-sans text-charcoal/60 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          Cuddly, colorful book bundles curated by age and reading level, delivered straight to your
          door — so the stories your kids love on screen can live on their shelf too. 📦✨
        </p>
        <button className="relative px-10 py-4 rounded-full bg-coral text-white font-nunito font-extrabold text-base shadow-card hover:scale-105 hover:shadow-card-hover transition-all animate-[buttonGlow_2.5s_ease-in-out_infinite]">
          Order for your kids 🧸
        </button>
      </div>
    </section>
  );
}
