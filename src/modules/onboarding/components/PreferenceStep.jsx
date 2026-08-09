import React from 'react';
import { motion } from 'framer-motion';

// One generic chip-grid step, reused for languages/interests/level/age-group
// instead of four near-identical step components — the same "extract the
// shared bit" call as useSectionFilter.js. Works for both multi-select
// (languages/interests, isSelected checks array membership) and single-select
// (level/age group, isSelected checks equality) since the caller owns the
// selection logic entirely.
export default function PreferenceStep({
  emoji, title, subtitle, options,
  getKey = (o) => o, getLabel = (o) => o, getIcon,
  isSelected, onSelect,
  onNext, onBack, nextDisabled, nextLabel = 'Continue',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto text-center"
    >
      {emoji && <span className="text-5xl inline-block mb-3" aria-hidden="true">{emoji}</span>}
      <h2 className="font-playfair font-bold text-2xl text-cocoa mb-1.5">{title}</h2>
      {subtitle && <p className="font-nunito-sans text-sm text-charcoal/60 mb-6">{subtitle}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {options.map((option) => {
          const key = getKey(option);
          const selected = isSelected(option);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={selected}
              className={`px-4 py-3.5 rounded-2xl border-2 font-nunito font-bold text-sm transition-all ${
                selected
                  ? 'bg-coral border-coral text-white shadow-card'
                  : 'bg-white border-gold/25 text-charcoal/70 hover:border-gold'
              }`}
            >
              {getIcon && <span className="block text-xl mb-1" aria-hidden="true">{getIcon(option)}</span>}
              {getLabel(option)}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 max-w-xs mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-full border-2 border-gold/30 text-charcoal/70 font-nunito font-bold text-sm hover:bg-gold/10 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 py-3 rounded-full bg-coral text-white font-nunito font-bold text-sm disabled:opacity-40 hover:scale-105 transition-transform shadow-card"
        >
          {nextLabel}
        </button>
      </div>
    </motion.div>
  );
}
