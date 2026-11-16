import React from 'react';
import { Search } from 'lucide-react';
import { POPULAR_SEARCHES } from '../helpConfig';

// Hero picture (girl + robot under the tree, "We're here to help!" note,
// "Questions today, Brighter readers tomorrow" sign and the Read/Learn/Grow/
// Belong books are all painted in). Same layout trick as ProfileHero: on lg+
// it's right-aligned so the baked-in note sits mid-hero beside the copy;
// below lg it's drawn wider than the screen so the note slides off-left.
export default function HelpHero({ query, onQueryChange, onSearch }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #D5E7F8 0%, #EDF4EC 60%, #E2EBCF 100%)' }}
    >
      <img
        src="/images/help/help-hero.jpg"
        alt="A smiling girl and a friendly robot under a tree, beside a sign reading Questions today, Brighter readers tomorrow"
        className="absolute inset-y-0 right-0 h-full w-[170%] lg:w-[62%] max-w-none object-cover object-right-top lg:object-right"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 14%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 14%)',
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: 'rgba(255,255,255,0.84)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 28%, rgba(255,255,255,0) 42%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-content mx-auto w-full px-4 sm:px-6 py-10 lg:py-0 lg:h-[330px] flex items-center">
        <div className="w-full max-w-[460px]">
          <h1 className="font-nunito font-extrabold text-4xl sm:text-[46px] leading-tight">
            <span style={{ color: '#0B1F4D' }}>How can we </span>
            <span style={{ color: '#F26A1B' }}>help?</span>
          </h1>
          <p className="font-nunito-sans text-[15px] sm:text-base mt-2 leading-snug" style={{ color: '#1F2A44' }}>
            We're here for you, because every reader matters. Browse our help topics, find answers, or reach out — we're happy to help!
          </p>

          <form
            role="search"
            onSubmit={handleSubmit}
            className="mt-5 flex items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_6px_20px_rgba(16,40,90,0.12)] border border-[#E3EAF6]"
          >
            <Search size={18} className="shrink-0" style={{ color: '#6B7280' }} aria-hidden="true" />
            <label htmlFor="help-search" className="sr-only">Search for help</label>
            <input
              id="help-search"
              type="search"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={'Search for help (e.g. "how to download a book")'}
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm font-nunito-sans focus:outline-none"
              style={{ color: '#0B1F4D' }}
            />
            <button
              type="submit"
              className="shrink-0 px-6 py-2.5 rounded-full text-white font-nunito font-bold text-sm hover:brightness-110 transition"
              style={{ background: '#0B3FAE' }}
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <span className="font-nunito font-bold text-xs" style={{ color: '#1F2A44' }}>Popular searches:</span>
            {POPULAR_SEARCHES.map(term => (
              <button
                key={term}
                type="button"
                onClick={() => onSearch(term)}
                className="px-3 py-1 rounded-full text-[11px] font-nunito-sans bg-white/80 border border-[#DCE4F2] hover:bg-white hover:border-[#0B3FAE] transition"
                style={{ color: '#1F2A44' }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
