import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOK_CATEGORIES } from '../../../utils/mockData';

function Select({ label, value, onChange, options, allLabel }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-nunito font-bold text-xs text-[var(--hero-ink)]">{label}</span>
      <div className="relative">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
          className="w-full appearance-none bg-[#F7F8FA] border border-[var(--hero-border)] rounded-xl pl-3 pr-8 py-2.5 text-sm font-nunito-sans text-[var(--hero-ink)] focus:outline-none focus:border-[var(--hero-green)]"
        >
          <option value="">{allLabel}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--hero-gray)]">▾</span>
      </div>
    </label>
  );
}

function ToggleRow({ icon, label, checked, onChange, disabled = false, note = null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-nunito-sans text-sm text-[var(--hero-ink)]">
        <span aria-hidden="true">{icon}</span>
        {label}
        {note && <span className="text-[10px] text-[var(--hero-gray)] font-nunito">({note})</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          disabled ? 'bg-black/10 cursor-not-allowed' : checked ? 'bg-[var(--hero-green)]' : 'bg-black/15'
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

// Persistent desktop filter sidebar for the Library page, matching the
// reference design's "Filter Books" panel. Mobile keeps using the existing
// FilterPanel drawer (opened from the hero's Filter button) rather than
// duplicating this same filter *logic* in a second component — this is
// purely a different presentation of the same useLibraryFilters state.
export default function LibrarySidebar({
  language, setLanguage, languageOptions,
  ageGroup, setAgeGroup, ageGroupOptions,
  activeCategory, onSelectCategory,
  level, setLevel, levelOptions,
  offlineOnly, setOfflineOnly,
  translatedOnly, setTranslatedOnly,
  onClear,
}) {
  const navigate = useNavigate();

  function scrollToResults() {
    document.getElementById('all-books-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-[272px] shrink-0 bg-white rounded-3xl border border-[var(--hero-border)] p-5 sticky top-24 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-nunito font-extrabold text-[15px] text-[var(--hero-ink)]">
          <span aria-hidden="true">🔽</span> Filter Books
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-nunito font-bold text-[var(--hero-orange)] hover:underline"
        >Reset</button>
      </div>

      <Select label="Language" value={language} onChange={setLanguage} options={languageOptions} allLabel="All Languages" />
      <Select label="Age Group" value={ageGroup} onChange={setAgeGroup} options={ageGroupOptions} allLabel="All Ages" />
      <Select label="Category" value={activeCategory} onChange={onSelectCategory} options={BOOK_CATEGORIES} allLabel="All Categories" />
      <Select label="Reading Level" value={level} onChange={setLevel} options={levelOptions} allLabel="All Levels" />

      <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[var(--hero-border)]">
        <ToggleRow icon="🎧" label="Audio Available" checked={false} onChange={() => {}} disabled note="coming soon" />
        <ToggleRow icon="⬇️" label="Offline Available" checked={offlineOnly} onChange={setOfflineOnly} />
        <ToggleRow icon="🌍" label="Translated Version" checked={translatedOnly} onChange={setTranslatedOnly} />
      </div>

      <button
        onClick={scrollToResults}
        className="w-full rounded-full py-3 text-white font-nunito font-bold text-sm transition-transform hover:scale-[1.02]"
        style={{ background: 'var(--hero-ink)' }}
      >
        Apply Filters
      </button>

      {/* The image itself already shows "Can't find a book? / Request a
          Book →" as part of its artwork — no separate caption/button
          duplicating that text; the whole card is the real, clickable
          "Request a Book" action instead. */}
      <button
        onClick={() => navigate('/help')}
        aria-label="Can't find a book? Request a story in your language."
        className="relative w-full rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all aspect-[1280/522]"
      >
        <img
          src="/images/find-a-book-illustration.jpg"
          alt="Can't find a book? Request a story in your language."
          className="absolute inset-0 w-full h-full object-cover"
        />
      </button>
    </aside>
  );
}
