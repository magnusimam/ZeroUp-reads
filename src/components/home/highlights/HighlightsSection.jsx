import React from 'react';
import WhyExistsHighlightCard from './WhyExistsHighlightCard';
import PopularBooksHighlightCard from './PopularBooksHighlightCard';
import LanguagesMapHighlightCard from './LanguagesMapHighlightCard';
import AmbientDecor from '../AmbientDecor';

// Replaces the old full-width "Featured Books" carousel section with a
// compact 3-card row (why we exist / popular books / languages map).
// `books` is passed down from HomePage's single booksService fetch rather
// than each card fetching its own copy (Modular Architecture — one source
// of truth for book data on the page).
export default function HighlightsSection({ books }) {
  return (
    <section style={{ background: 'var(--cream)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      <AmbientDecor count={5} offset={4} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24, alignItems: 'stretch',
        }}>
          <WhyExistsHighlightCard />
          <PopularBooksHighlightCard books={books} />
          <LanguagesMapHighlightCard />
        </div>
      </div>
    </section>
  );
}
