import React from 'react';
import { Lightbulb } from 'lucide-react';

// The amber "Did you know?" callout under the page content — `fact` comes
// from funFacts.js#getFunFact (book-authored fact, or a category fallback),
// so this component stays purely presentational.
export default function DidYouKnowCard({ fact }) {
  if (!fact) return null;

  return (
    <div className="mt-6 rounded-3xl bg-story-yellow/60 border border-story-orange/15 px-5 py-4 flex items-center gap-4">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shrink-0">
        <Lightbulb size={18} className="text-story-orange" />
      </span>
      <div className="flex-1">
        <p className="font-nunito font-extrabold text-ink-primary text-sm mb-0.5">Did you know?</p>
        <p className="text-ink-secondary text-sm leading-relaxed">{fact.text}</p>
      </div>
      <span className="text-3xl shrink-0 hidden sm:block" aria-hidden="true">{fact.icon}</span>
    </div>
  );
}
