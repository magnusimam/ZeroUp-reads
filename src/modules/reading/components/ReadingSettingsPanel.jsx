import React from 'react';
import { X, Minus, Plus, Moon, Sun } from 'lucide-react';

// Opened from either the header's "Text Size" button or the bottom
// toolbar's "Settings" button — one shared panel instead of two separate
// implementations of the same font-size/night-mode controls.
export default function ReadingSettingsPanel({ open, onClose, fontSize, onIncrease, onDecrease, nightMode, onToggleNightMode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-story-navy/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-story-float w-full max-w-xs p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-nunito font-extrabold text-story-navy text-lg">Reading Settings</h3>
          <button onClick={onClose} aria-label="Close settings" className="w-8 h-8 rounded-full flex items-center justify-center text-story-navy/60 hover:bg-story-cream">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs font-nunito font-extrabold text-ink-secondary uppercase tracking-wide mb-2">Text Size</p>
        <div className="flex items-center justify-between gap-2 mb-5">
          <button
            onClick={onDecrease}
            aria-label="Decrease text size"
            className="w-10 h-10 rounded-full border border-story-navy/15 flex items-center justify-center text-story-navy hover:bg-story-cream"
          >
            <Minus size={16} />
          </button>
          <span className="font-nunito font-bold text-ink-primary" style={{ fontSize: `${fontSize}px` }}>Aa</span>
          <button
            onClick={onIncrease}
            aria-label="Increase text size"
            className="w-10 h-10 rounded-full border border-story-navy/15 flex items-center justify-center text-story-navy hover:bg-story-cream"
          >
            <Plus size={16} />
          </button>
        </div>

        <p className="text-xs font-nunito font-extrabold text-ink-secondary uppercase tracking-wide mb-2">Night Mode</p>
        <button
          onClick={onToggleNightMode}
          className="w-full flex items-center justify-between rounded-2xl border border-story-navy/15 px-4 py-3"
        >
          <span className="inline-flex items-center gap-2 font-nunito font-bold text-ink-primary text-sm">
            {nightMode ? <Moon size={16} /> : <Sun size={16} />} {nightMode ? 'On' : 'Off'}
          </span>
          <span className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${nightMode ? 'bg-story-orange justify-end' : 'bg-story-navy/15 justify-start'}`}>
            <span className="w-5 h-5 rounded-full bg-white shadow" />
          </span>
        </button>
      </div>
    </div>
  );
}
