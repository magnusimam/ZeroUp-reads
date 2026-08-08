import React from 'react';
import WhyExistsHighlightCard from './WhyExistsHighlightCard';
import LanguagesMapHighlightCard from './LanguagesMapHighlightCard';

// Replaces the old full-width "Featured Books" carousel section with a
// compact 2-card row (why we exist / languages map). Popular Books grew into
// its own full-width row (PopularBooksSection, rendered separately on
// HomePage) instead of being squeezed into a third grid tile here.
export default function HighlightsSection() {
  return (
    <section style={{ background: 'var(--cream)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24, alignItems: 'stretch',
        }}>
          <WhyExistsHighlightCard />
          <LanguagesMapHighlightCard />
        </div>
      </div>
    </section>
  );
}
