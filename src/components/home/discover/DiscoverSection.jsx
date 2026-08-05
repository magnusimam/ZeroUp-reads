import React from 'react';
import SearchBar from './SearchBar';
import ExploreLanguages from './ExploreLanguages';
import BrowseCategories from './BrowseCategories';
import ReadingLevelPicker from './ReadingLevelPicker';
import AmbientDecor from '../AmbientDecor';

// Stacked full-width rows (screenshot-matched) rather than a 3-card grid:
// search bar, language pills, categories, then the reading-level cards.
export default function DiscoverSection() {
  return (
    <section style={{ background: 'var(--cream)', padding: '40px 0 8px', position: 'relative', overflow: 'hidden' }}>
      <AmbientDecor count={6} offset={0} />
      <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 36 }}>
        <SearchBar />
        <ExploreLanguages />
        <BrowseCategories />
        <ReadingLevelPicker />
      </div>
    </section>
  );
}
