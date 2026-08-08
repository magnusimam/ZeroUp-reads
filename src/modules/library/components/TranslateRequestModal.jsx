import React from 'react';
import { BOOK_LANGUAGES } from '../../../utils/mockData';

// Reader-facing translate modal — deliberately separate from AdminCMSPage's
// own translate modal (useBookUpload.js), which still translates instantly.
// This one only queues a request; nothing publishes until an admin approves it.
export default function TranslateRequestModal({ book, language, onLanguageChange, submitting, onCancel, onSubmit }) {
  if (!book) return null;

  const languageOptions = BOOK_LANGUAGES.filter((l) => l !== book.language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} />
      <div className="relative bg-cream rounded-[28px] p-6 w-full max-w-sm shadow-2xl border-2 border-gold/30">
        <div className="text-center mb-2">
          <span className="text-5xl inline-block animate-[popIn_450ms_ease]" aria-hidden="true">🌍</span>
        </div>
        <h3 className="font-playfair font-bold text-xl text-cocoa text-center mb-1">
          Ask for a Translation!
        </h3>
        <p className="font-nunito-sans text-sm text-charcoal/60 text-center mb-5">
          Want <span className="font-bold text-cocoa">{book.title}</span> in another language?
          We'll ask an admin to add it. ✨
        </p>

        <label className="block font-nunito font-bold text-sm text-charcoal/70 mb-1.5">
          Choose a language
        </label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-full border-2 border-gold/30 bg-white text-sm font-nunito-sans text-charcoal focus:outline-none focus:border-sky-blue mb-5"
        >
          <option value="">Select a language…</option>
          {languageOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border-2 border-gold/30 text-charcoal/70 text-sm font-nunito font-bold hover:bg-gold/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!language || submitting}
            className="flex-1 py-2.5 rounded-full bg-coral text-white text-sm font-nunito font-bold disabled:opacity-50 hover:scale-105 transition-transform shadow-card"
          >
            {submitting ? 'Sending…' : 'Send Request 💌'}
          </button>
        </div>
      </div>
    </div>
  );
}
