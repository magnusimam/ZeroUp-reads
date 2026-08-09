import React from 'react';

// Shown instead of the Story/Educational sections once a search returns zero
// books across the whole catalogue, so a reader sees one clear message
// instead of two separate "no matches" notes stacked on top of each other.
export default function EmptySearchState() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-20 text-center">
      <div style={{ fontSize: 64, lineHeight: 1 }} aria-hidden="true">🔍📚</div>
      <h2 className="font-playfair font-bold text-2xl text-cocoa mt-5">No books found</h2>
      <p className="font-nunito-sans text-charcoal/60 mt-2 max-w-md mx-auto">
        We couldn't find any books matching your search. Try another keyword.
      </p>
    </section>
  );
}
