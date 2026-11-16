import React from 'react';
import { Globe, Check, ChevronRight } from 'lucide-react';
import { LANGUAGE_FLAG } from '../../books/languageFlags';
import { MACHINE_TRANSLATION_LANGUAGES } from '../../translation/machineTranslationConfig';

function Row({ label, flag, selected, onClick }) {
  return (
    <button
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 text-sm font-nunito font-bold transition-colors ${
        selected ? 'text-story-orange bg-story-yellow/50' : 'text-ink-primary hover:bg-story-cream'
      }`}
    >
      <span className="inline-flex items-center gap-2.5">
        <span className="text-base leading-none">{flag}</span> {label}
      </span>
      {selected && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-story-orange text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// Dropdown under the reader header's Translate button. "Original" plus the
// machine-translation languages (same choice as the navbar's Translate
// button — one shared setting via machineTranslationService); "Request a
// human translation" still funnels into the existing translator-request flow.
export default function TranslateMenu({ book, targetCode, machineTranslationOn, onChoose, onMoreLanguages }) {
  const others = MACHINE_TRANSLATION_LANGUAGES.filter(l => l.name !== book.language);

  return (
    <div
      className="notranslate absolute right-0 top-[calc(100%+8px)] z-40 w-64 bg-white rounded-2xl shadow-story-float border border-story-navy/8 py-3 font-nunito-sans"
      role="menu"
    >
      <div className="flex items-center gap-2 px-4 pb-2 mb-1 border-b border-story-navy/8">
        <Globe size={16} className="text-story-navy/60" />
        <span className="text-xs font-nunito font-extrabold text-story-navy/60 uppercase tracking-wide">
          Translate to
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto">
        <Row
          label={`${book.language} (original)`}
          flag={LANGUAGE_FLAG[book.language] || '🌍'}
          selected={!targetCode || targetCode === MACHINE_TRANSLATION_LANGUAGES.find(l => l.name === book.language)?.code}
          onClick={() => onChoose(null)}
        />
        {machineTranslationOn && others.map(lang => (
          <Row
            key={lang.code}
            label={lang.name}
            flag={LANGUAGE_FLAG[lang.name] || '🌍'}
            selected={targetCode === lang.code}
            onClick={() => onChoose(lang.code)}
          />
        ))}
      </div>

      {machineTranslationOn && (
        <p className="px-4 pt-2 text-[11px] leading-snug text-ink-secondary">
          Machine translation while our AI translator is being built.
        </p>
      )}

      <div className="mt-1 pt-2 border-t border-story-navy/8 px-2">
        <button
          role="menuitem"
          onClick={onMoreLanguages}
          className="w-full flex items-center justify-between px-2 py-2 text-sm font-nunito font-bold text-ink-secondary hover:text-story-orange transition-colors"
        >
          Request a human translation <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
