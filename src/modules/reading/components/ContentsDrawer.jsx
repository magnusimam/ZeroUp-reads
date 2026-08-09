import React from 'react';
import { X, MapPin } from 'lucide-react';

// Bottom-toolbar "Contents" — a slide-over listing every page in the book so
// a reader can jump straight to one, instead of only stepping through with
// Previous/Next. Pages already come from `book.content` (ReadingPage's
// existing pagination source), so this never drifts from what Next/Previous
// actually page through.
export default function ContentsDrawer({ open, onClose, content, currentIndex, bookmarkedIndex, onJump }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-story-navy/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-story-float flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-story-navy/8">
          <h3 className="font-nunito font-extrabold text-story-navy text-lg">Contents</h3>
          <button onClick={onClose} aria-label="Close contents" className="w-8 h-8 rounded-full flex items-center justify-center text-story-navy/60 hover:bg-story-cream">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {content.map((paragraph, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`w-full text-left rounded-2xl px-4 py-3 mb-1.5 transition-colors ${
                i === currentIndex ? 'bg-story-yellow/60' : 'hover:bg-story-cream'
              }`}
            >
              <span className="flex items-center gap-2 mb-0.5">
                <span className={`font-nunito font-extrabold text-xs ${i === currentIndex ? 'text-story-orange' : 'text-ink-secondary'}`}>
                  Page {i + 1}
                </span>
                {bookmarkedIndex === i && <MapPin size={12} className="text-story-orange" fill="currentColor" />}
              </span>
              <span className="block text-ink-primary text-sm leading-snug line-clamp-2">{paragraph}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
