import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const NAV_LINKS = [
  { label: 'Discover', to: '/library' },
  { label: 'My Books', to: '/profile' },
  { label: 'Categories', to: '#categories' },
];

// Site display-language switcher — a different concept from BOOK_LANGUAGES
// (what language a book's content is written in). Not yet wired to i18n.
const UI_LANGUAGES = ['English', 'Swahili', 'Yoruba', 'Zulu', 'French'];

export default function LibraryHeader() {
  const auth = useAuth();
  const user = auth?.user;
  const initial = user?.name ? user.name[0].toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-gold/20">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-4">
        {/* Brand */}
        <Link to="/library" className="shrink-0 font-cinzel font-bold text-cocoa text-lg sm:text-xl tracking-wide">
          ZeroUp Reads <span className="hidden sm:inline">Library</span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-8 mx-auto">
          {NAV_LINKS.map(link =>
            link.to.startsWith('#') ? (
              <a
                key={link.label}
                href={link.to}
                className="font-nunito font-semibold text-sm text-charcoal/70 hover:text-cocoa transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="font-nunito font-semibold text-sm text-charcoal/70 hover:text-cocoa transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center relative">
            <span className="absolute left-3 text-charcoal/30 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Quick search…"
              className="w-40 xl:w-56 pl-8 pr-3 py-2 rounded-lg bg-white border border-gold/20 text-charcoal text-sm placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <select
            aria-label="Language"
            defaultValue="English"
            className="hidden sm:block bg-white border border-gold/20 text-charcoal/80 text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-gold"
          >
            {UI_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <button
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-cocoa hover:bg-black/5 transition-colors"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
          </button>

          <Link
            to="/profile"
            aria-label="My profile"
            className="w-10 h-10 rounded-full bg-gold text-ink font-bold flex items-center justify-center font-nunito hover:opacity-90 transition-opacity"
          >
            {initial || '👤'}
          </Link>
        </div>
      </div>
    </header>
  );
}
