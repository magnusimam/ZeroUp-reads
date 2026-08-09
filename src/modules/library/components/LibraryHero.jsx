import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_CHIPS, SORT_OPTIONS, LIBRARY_STATS_DISPLAY } from '../libraryConfig';
import FilterPanel from './FilterPanel';
import AmbientDecor from '../../../components/home/AmbientDecor';

// One playful color per chip position so the category row reads as a row of
// candy-colored pills instead of a monochrome gold list. Written as full
// literal class strings (not `bg-${color}` interpolation) so Tailwind's
// static scanner actually generates them.
const CHIP_ACTIVE_CLASSES = [
  'bg-amber text-white border-amber',
  'bg-green text-white border-green',
  'bg-sky-blue text-white border-sky-blue',
  'bg-coral text-white border-coral',
  'bg-navy text-white border-navy',
];

export default function LibraryHero({
  activeCategory, onToggleCategory, search, onSearchChange,
  language, setLanguage, languageOptions,
  level, setLevel, levelOptions,
  sort, setSort, onClearFilters,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('Sort');

  function openPanel(tab) {
    setPanelTab(tab);
    setPanelOpen(true);
  }

  return (
    <section id="categories" className="relative w-full overflow-hidden">
      {/* Warm background treatment — scoped to this section only */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF3D6] via-cream to-cream" />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <div
          className="absolute top-10 left-[8%] w-72 h-72 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,160,32,0.18) 0%, rgba(232,160,32,0) 70%)' }}
        />
      </div>

      <AmbientDecor count={6} />

      <div className="relative z-10 px-4 sm:px-6 pt-6 pb-10 max-w-content mx-auto w-full">
        <Link
          to="/"
          className="inline-block text-charcoal/50 hover:text-cocoa text-xs sm:text-sm font-nunito-sans hover:underline underline-offset-4 transition-colors mb-6"
        >
          ← Back Home
        </Link>

        <h1 className="font-playfair font-extrabold text-3xl sm:text-5xl text-cocoa text-center">
          <span className="inline-block animate-[float_3.5s_ease-in-out_infinite]" aria-hidden="true">📚</span>{' '}
          Our Storybook Library{' '}
          <span className="inline-block animate-[float_3.5s_ease-in-out_infinite_0.4s]" aria-hidden="true">✨</span>
        </h1>
        <p className="font-nunito-sans text-charcoal/60 text-center max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
          We are closing Africa's literacy gap — one mother-tongue story at a time! ZeroUp Reads
          brings storytime to life in Hausa, Yoruba, Igbo, Pidgin, Swahili, Zulu and more. 🌍💛
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {CATEGORY_CHIPS.map((cat, i) => {
            const active = activeCategory === cat;
            const activeClasses = CHIP_ACTIVE_CLASSES[i % CHIP_ACTIVE_CLASSES.length];
            return (
              <span
                key={cat}
                className={`inline-flex items-center rounded-full text-sm font-nunito font-bold border-2 transition-all hover:-translate-y-0.5 ${
                  active
                    ? `${activeClasses} pl-5 pr-2 py-2 shadow-card`
                    : 'bg-white text-charcoal/70 border-gold/25 hover:border-gold hover:text-cocoa'
                }`}
              >
                <button
                  onClick={() => onToggleCategory(cat)}
                  className={active ? '' : 'px-5 py-2'}
                >
                  {cat}
                </button>
                {active && (
                  <button
                    onClick={() => onToggleCategory(cat)}
                    aria-label={`Clear ${cat} filter`}
                    className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 text-xs leading-none"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* Search bar — filters Story Books + Educational Books live, on every keystroke */}
        <div className="flex gap-3 max-w-xl mx-auto mt-8">
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search for a story or author… 🔍"
            aria-label="Search by title, author, category, language or reading level"
            className="flex-1 px-5 py-3 rounded-full bg-white border-2 border-gold/20 text-charcoal placeholder-charcoal/30 text-sm focus:outline-none focus:border-sky-blue transition-colors shadow-card"
          />
          <button
            type="button"
            onClick={() => onSearchChange(search)}
            className="px-6 py-3 rounded-full bg-coral text-white font-nunito font-extrabold text-sm hover:scale-105 hover:shadow-card-hover transition-transform shrink-0"
          >
            Search
          </button>
        </div>

        {/* Stats + sort/filter */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-10 pt-6 border-t-2 border-dashed border-gold/25">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-1.5 shadow-card border-2 border-green/20">
              <span aria-hidden="true">📖</span>
              <span className="font-playfair font-bold text-cocoa text-lg">{LIBRARY_STATS_DISPLAY.reads.value}</span>
              <span className="font-nunito-sans text-charcoal/50 text-xs">{LIBRARY_STATS_DISPLAY.reads.label}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-1.5 shadow-card border-2 border-sky-blue/20">
              <span aria-hidden="true">🌍</span>
              <span className="font-playfair font-bold text-cocoa text-lg">{LIBRARY_STATS_DISPLAY.languages.value}</span>
              <span className="font-nunito-sans text-charcoal/50 text-xs">{LIBRARY_STATS_DISPLAY.languages.label}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openPanel('Sort')}
              className="px-4 py-2 rounded-full border-2 border-gold/30 bg-white text-charcoal/70 text-sm font-nunito font-bold hover:border-gold hover:text-cocoa transition-colors"
            >
              ↕️ Sort
            </button>
            <button
              onClick={() => openPanel('Language')}
              className="px-4 py-2 rounded-full border-2 border-gold/30 bg-white text-charcoal/70 text-sm font-nunito font-bold hover:border-gold hover:text-cocoa transition-colors"
            >
              🎛️ Filter
            </button>
          </div>
        </div>

        <FilterPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          initialTab={panelTab}
          language={language} setLanguage={setLanguage} languageOptions={languageOptions}
          level={level} setLevel={setLevel} levelOptions={levelOptions}
          sort={sort} setSort={setSort} sortOptions={SORT_OPTIONS}
          onClear={onClearFilters}
        />
      </div>
    </section>
  );
}
