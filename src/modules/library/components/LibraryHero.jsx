import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_CHIPS, SORT_OPTIONS, LIBRARY_STATS_DISPLAY } from '../libraryConfig';
import FilterPanel from './FilterPanel';

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

      <div className="relative z-10 px-4 sm:px-6 pt-6 pb-10 max-w-content mx-auto w-full">
        <Link
          to="/"
          className="inline-block text-charcoal/50 hover:text-cocoa text-xs sm:text-sm font-nunito-sans hover:underline underline-offset-4 transition-colors mb-6"
        >
          Home →
        </Link>

        <h1 className="font-playfair font-extrabold text-3xl sm:text-5xl text-cocoa text-center">
          Knowledge Library
        </h1>
        <p className="font-nunito-sans text-charcoal/60 text-center max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
          We are closing Africa's literacy gap — one mother-tongue story at a time. ZeroUp Reads
          preserves endangered African languages by making books accessible in Hausa, Yoruba, Igbo,
          Pidgin, Swahili, Zulu and more.
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {CATEGORY_CHIPS.map(cat => {
            const active = activeCategory === cat;
            return (
              <span
                key={cat}
                className={`inline-flex items-center rounded-full text-sm font-nunito font-semibold border transition-colors ${
                  active
                    ? 'bg-gold text-ink border-gold pl-5 pr-2 py-2'
                    : 'bg-white text-charcoal/70 border-gold/30 hover:border-gold hover:text-cocoa'
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
                    className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full text-ink/70 hover:text-ink hover:bg-ink/10 text-xs leading-none"
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
            placeholder="Search by title or author…"
            aria-label="Search by title or author"
            className="flex-1 px-5 py-3 rounded-xl bg-white border border-gold/20 text-charcoal placeholder-charcoal/30 text-sm focus:outline-none focus:border-gold transition-colors"
          />
          <button
            type="button"
            onClick={() => onSearchChange(search)}
            className="px-6 py-3 rounded-xl bg-gold text-ink font-nunito font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
          >
            Search
          </button>
        </div>

        {/* Stats + sort/filter */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-10 pt-6 border-t border-gold/20">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-playfair font-bold text-cocoa text-xl">{LIBRARY_STATS_DISPLAY.reads.value}</span>
              <span className="font-nunito-sans text-charcoal/50 text-sm ml-2">{LIBRARY_STATS_DISPLAY.reads.label}</span>
            </div>
            <div>
              <span className="font-playfair font-bold text-cocoa text-xl">{LIBRARY_STATS_DISPLAY.languages.value}</span>
              <span className="font-nunito-sans text-charcoal/50 text-sm ml-2">{LIBRARY_STATS_DISPLAY.languages.label}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openPanel('Sort')}
              className="px-4 py-2 rounded-lg border border-gold/30 text-charcoal/70 text-sm font-nunito font-semibold hover:border-gold hover:text-cocoa transition-colors"
            >
              Sort
            </button>
            <button
              onClick={() => openPanel('Language')}
              className="px-4 py-2 rounded-lg border border-gold/30 text-charcoal/70 text-sm font-nunito font-semibold hover:border-gold hover:text-cocoa transition-colors"
            >
              Filter
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
