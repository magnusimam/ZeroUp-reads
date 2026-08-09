import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

// One glossary word inside the story text — dotted-underline, tap to reveal
// a small definition popover (matches the reference design's "wise" callout).
// Self-contained: owns its own open/closed state and closes on an outside
// click, so ReadingText can render several of these per paragraph freely.
export default function VocabularyWord({ word, definition }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  function speak(e) {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  }

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-bold text-[#7C5CD6] underline decoration-dotted decoration-2 underline-offset-4 hover:text-story-navy transition-colors"
      >
        {word}
      </button>

      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+10px)] z-30 w-56 bg-white rounded-2xl shadow-story-float border border-story-navy/10 px-4 py-3 text-left">
          <span className="flex items-center gap-2 mb-1">
            <span className="font-nunito font-extrabold text-ink-primary text-sm">{word.toLowerCase()}</span>
            {typeof window !== 'undefined' && window.speechSynthesis && (
              <button
                type="button"
                onClick={speak}
                aria-label={`Hear "${word}" pronounced`}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-story-lavender text-[#7C5CD6] hover:brightness-95"
              >
                <Volume2 size={13} />
              </button>
            )}
          </span>
          <span className="block text-ink-secondary text-xs leading-relaxed font-nunito-sans">{definition}</span>
        </span>
      )}
    </span>
  );
}
