import React, { useState } from 'react';
import { SORT_OPTIONS, HERO_CATEGORY_CHIPS } from '../libraryConfig';
import { getCategoryTileTheme } from '../../books/categoryTheme';
import FilterPanel from './FilterPanel';

const CHIP_ICONS = {
  Science: '🧪', Technology: '💻', Animals: '🐾', Adventure: '⛰️',
  Culture: '🛡️', Health: '❤️',
};
const CHIP_BG = { coral: '#FF6B6B', 'sky-blue': '#2D6BE4', violet: '#6C5FBC', navy: '#1F3D6E', green: '#3DBE8A', amber: '#E8A020' };

// Small colored circle behind each chip's icon, using the same category ->
// color mapping the book tiles use (categoryTheme.js) — one palette for
// "this category is blue/green/amber/etc" across the whole page.
function IconBadge({ bg, children }) {
  return (
    <span
      aria-hidden="true"
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] leading-none"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

function ChipIcon({ cat }) {
  if (cat === 'Health') return <span aria-hidden="true">❤️</span>;
  const { color } = getCategoryTileTheme(cat);
  return <IconBadge bg={CHIP_BG[color] || CHIP_BG.navy}>{CHIP_ICONS[cat] || '📖'}</IconBadge>;
}

export default function LibraryHero({
  activeCategory, onToggleCategory, search, onSearchChange,
  language, setLanguage, languageOptions,
  level, setLevel, levelOptions,
  ageGroup, setAgeGroup, ageGroupOptions,
  offlineOnly, setOfflineOnly,
  translatedOnly, setTranslatedOnly,
  sort, setSort, onClearFilters,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('Sort');

  function openPanel(tab) {
    setPanelTab(tab);
    setPanelOpen(true);
  }

  // Search already filters live on every keystroke (useLibraryFilters) —
  // submitting (Enter, or the Search button) just takes the reader straight
  // to the results instead of leaving them scrolled up at the hero.
  function runSearch(e) {
    e.preventDefault();
    document.getElementById('all-books-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section id="categories" className="relative w-full overflow-hidden">
      {/* Full-bleed illustrated banner — the child reading under the tree
          beside the robot, matching the reference design's header photo. */}
      <div className="relative w-full overflow-hidden h-[300px] sm:h-[360px] lg:h-[420px]">
        {/* Full-bleed cover crop at every width — object-right on mobile
            anchors the crop window to the photo's right edge, which is
            exactly where the robot and book stack sit, so they're always
            fully shown (nothing to the right of them can ever be cropped
            off); wider screens have enough width visible to use the more
            centered 62% framing instead. */}
        <img
          src="/images/library-hero-reading.jpg"
          alt="A child reading a storybook under a tree beside a friendly robot, with a village in the distance"
          className="absolute inset-0 w-full h-full object-cover object-right sm:object-[62%_center]"
        />
        {/* Left-side scrim — the sky in the photo is bright enough on its own,
            this just guarantees the title/search stay legible at every width. */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 34%, rgba(255,255,255,0) 60%)' }}
          aria-hidden="true"
        />

        {/* Handwritten flourish, matching the reference's diagonal "A story
            for every child" note over the mountains. */}
        <div
          className="hidden sm:block absolute left-[38%] top-6 sm:top-8 font-handwriting text-xl sm:text-2xl"
          style={{ color: 'var(--navy)', transform: 'rotate(-8deg)' }}
          aria-hidden="true"
        >
          A story<br />for every child <span style={{ color: 'var(--coral, #FF6B6B)' }}>♥</span>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-content mx-auto w-full px-4 sm:px-6">
            <div className="max-w-md">
              <h1 className="font-nunito font-extrabold text-4xl sm:text-5xl drop-shadow-sm" style={{ color: 'var(--navy)' }}>
                Library
              </h1>
              <p className="font-nunito-sans mt-3 text-base drop-shadow-sm" style={{ color: 'var(--hero-gray)' }}>
                Discover stories, knowledge and ideas in your language.
              </p>

              {/* Search bar — one continuous pill: field, language select,
                  circular submit button, matching the reference exactly. */}
              <form onSubmit={runSearch} className="flex items-center mt-6 bg-white rounded-full shadow-card pr-1.5 h-14 max-w-xl">
                <span aria-hidden="true" className="pl-5 pr-2 text-[var(--hero-gray)]">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Find a story, book, or topic…"
                  aria-label="Search by title, author, category, language or reading level"
                  className="flex-1 min-w-0 bg-transparent text-sm font-nunito-sans outline-none"
                  style={{ color: 'var(--hero-ink)' }}
                />
                <span className="hidden sm:block w-px h-6 bg-[var(--hero-border)] mx-2" aria-hidden="true" />
                <select
                  aria-label="Language"
                  value={language || ''}
                  onChange={e => setLanguage(e.target.value || null)}
                  className="hidden sm:block bg-transparent text-sm font-nunito font-bold outline-none pr-2"
                  style={{ color: 'var(--hero-ink)' }}
                >
                  <option value="">All Languages</option>
                  {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-full text-white font-nunito font-bold text-sm shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--navy)' }}
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Small label sitting on the stack of books at the right edge of
            the photo — was a large floating caption, shrunk down to read
            like a tag on the books themselves. */}
        <div className="hidden sm:block absolute right-3 sm:right-5 bottom-24 sm:bottom-28 text-right leading-tight">
          <p className="font-nunito font-extrabold text-[10px] sm:text-xs text-white drop-shadow">BIG STORIES</p>
          <p className="font-nunito font-extrabold text-[10px] sm:text-xs drop-shadow" style={{ color: 'var(--hero-orange)' }}>BRIGHT FUTURES</p>
        </div>

      </div>

      {/* Category chip row — a normal-flow block (not position:absolute
          inside the fixed-height photo above), so it can never overlap the
          title/search bar sitting higher up in that photo. Only pulled up
          over the photo's bottom edge with a negative margin from sm: up,
          where a single row of chips is short enough to sit there safely;
          on a phone screen it sits in its own space right below the photo
          with no overlap at all. Shows only the first 3 categories on a
          phone screen (+ "More", which already opens the same filter panel
          the old separate "Filters" button did — one button, not two). */}
      <div className="relative sm:-mt-16 pb-4 sm:pb-6">
        <div className="max-w-content mx-auto w-full px-4 sm:px-6 flex flex-wrap gap-2 sm:gap-2.5">
          <button
            onClick={() => activeCategory && onToggleCategory(activeCategory)}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-nunito font-bold border shadow-card transition-colors"
            style={
              !activeCategory
                ? { background: '#E8F1FF', color: 'var(--hero-ink)', borderColor: 'var(--sky-blue, #2D6BE4)' }
                : { background: 'white', color: 'var(--hero-ink)', borderColor: 'var(--hero-border)' }
            }
          >
            <IconBadge bg="#2D6BE4">⊞</IconBadge>
            All
          </button>
          {HERO_CATEGORY_CHIPS.map((cat, i) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-nunito font-bold border shadow-card transition-colors ${i < 3 ? 'flex' : 'hidden sm:flex'}`}
                style={
                  active
                    ? { background: '#E8F1FF', color: 'var(--hero-ink)', borderColor: 'var(--sky-blue, #2D6BE4)' }
                    : { background: 'white', color: 'var(--hero-ink)', borderColor: 'var(--hero-border)' }
                }
              >
                <ChipIcon cat={cat} />
                {cat}
              </button>
            );
          })}
          <button
            onClick={() => openPanel('Sort')}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-nunito font-bold bg-white border border-[var(--hero-border)] shadow-card"
            style={{ color: 'var(--hero-ink)' }}
          >
            <span aria-hidden="true">⋯</span> More
          </button>
        </div>
      </div>

      <FilterPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTab={panelTab}
        language={language} setLanguage={setLanguage} languageOptions={languageOptions}
        level={level} setLevel={setLevel} levelOptions={levelOptions}
        ageGroup={ageGroup} setAgeGroup={setAgeGroup} ageGroupOptions={ageGroupOptions}
        offlineOnly={offlineOnly} setOfflineOnly={setOfflineOnly}
        translatedOnly={translatedOnly} setTranslatedOnly={setTranslatedOnly}
        sort={sort} setSort={setSort} sortOptions={SORT_OPTIONS}
        onClear={onClearFilters}
      />
    </section>
  );
}
