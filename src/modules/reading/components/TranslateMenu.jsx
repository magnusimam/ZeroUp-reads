import React from 'react';
import { Globe, Check, ChevronRight } from 'lucide-react';
import { LANGUAGE_FLAG } from '../../books/languageFlags';

// Dropdown anchored under the header's Translate button. Lists the
// languages this specific book is actually available in
// (book.attributes.availableLanguages — same field BookDetailPage already
// reads via useBookDetail) with a checkmark on whichever is currently being
// read; everything else funnels into "More Languages", which reuses the
// existing reader translation-request flow instead of a second one.
export default function TranslateMenu({ book, availableLanguages, onSelectAvailable, onMoreLanguages }) {
  return (
    <div
      className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 bg-white rounded-2xl shadow-story-float border border-story-navy/8 py-3 font-nunito-sans"
      role="menu"
    >
      <div className="flex items-center gap-2 px-4 pb-2 mb-1 border-b border-story-navy/8">
        <Globe size={16} className="text-story-navy/60" />
        <span className="text-xs font-nunito font-extrabold text-story-navy/60 uppercase tracking-wide">
          Translate to
        </span>
      </div>

      {availableLanguages.map((lang) => {
        const selected = lang === book.language;
        return (
          <button
            key={lang}
            role="menuitem"
            onClick={() => onSelectAvailable(lang)}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm font-nunito font-bold transition-colors ${
              selected ? 'text-story-orange bg-story-yellow/50' : 'text-ink-primary hover:bg-story-cream'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="text-base leading-none">{LANGUAGE_FLAG[lang] || '🌍'}</span> {lang}
            </span>
            {selected && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-story-orange text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}

      <div className="mt-1 pt-2 border-t border-story-navy/8 px-2">
        <button
          role="menuitem"
          onClick={onMoreLanguages}
          className="w-full flex items-center justify-between px-2 py-2 text-sm font-nunito font-bold text-ink-secondary hover:text-story-orange transition-colors"
        >
          More Languages <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
