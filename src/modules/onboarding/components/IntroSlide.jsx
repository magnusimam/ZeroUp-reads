import React from 'react';
import { motion } from 'framer-motion';

export default function IntroSlide({ slide, index, total, isLast, onNext, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto text-center"
    >
      <span className="text-6xl inline-block mb-5 animate-[popIn_450ms_ease]" aria-hidden="true">
        {slide.emoji}
      </span>
      <h2 className="font-playfair font-bold text-3xl text-cocoa mb-3">{slide.title}</h2>
      <p className="font-nunito-sans text-charcoal/60 leading-relaxed mb-8">{slide.text}</p>

      <div className="flex justify-center gap-1.5 mb-8" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-coral' : 'w-1.5 bg-gold/30'}`}
          />
        ))}
      </div>

      <div className="flex gap-3 max-w-xs mx-auto">
        {!isLast && (
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-3 rounded-full border-2 border-gold/30 text-charcoal/70 font-nunito font-bold text-sm hover:bg-gold/10 transition-colors"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 rounded-full bg-coral text-white font-nunito font-bold text-sm hover:scale-105 transition-transform shadow-card"
        >
          {isLast ? "Let's go" : 'Next'}
        </button>
      </div>
    </motion.div>
  );
}
