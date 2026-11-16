import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Languages } from 'lucide-react';

// Navbar "Translate a Story" button → the /translate page, which explains
// the feature and walks a reader through picking a story and a language.
// (Separate from the 🌐 website-language selector, which changes the site's
// own menus and pages, not books.)
export default function TranslateStoryLink({ variant = 'desktop' }) {
  const { pathname } = useLocation();
  const active = pathname === '/translate';

  if (variant === 'mobile') {
    return (
      <Link
        to="/translate"
        className="notranslate flex items-center gap-2"
        style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--hero-orange)', textDecoration: 'none' }}
      >
        <Languages size={20} aria-hidden="true" /> Translate a Story
      </Link>
    );
  }

  return (
    <Link
      to="/translate"
      className="notranslate"
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: active ? 'rgba(242,106,27,0.10)' : 'white',
        border: `1.5px solid ${active ? 'var(--hero-orange)' : 'var(--hero-border)'}`,
        borderRadius: 999, padding: '9px 14px', minHeight: 40, textDecoration: 'none', whiteSpace: 'nowrap',
        fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--hero-ink)',
        transition: 'border-color 200ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hero-orange)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--hero-border)'; }}
    >
      <Languages size={18} aria-hidden="true" style={{ color: 'var(--hero-orange)' }} />
      Translate a Story
    </Link>
  );
}
