import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SITE_LANGUAGES } from './siteTranslationConfig';
import * as siteTranslationService from './siteTranslationService';

// Navbar language selector ("🌐 EN ▾"): the language the *website* (menus,
// buttons, page copy) is shown in. Separate from the Translate button
// (modules/translation/components/TranslateBooksButton), which translates
// *book text*. `variant="mobile"` renders a plain select for the hamburger
// overlay instead of a dropdown.
export default function SiteLanguageSelector({ variant = 'desktop' }) {
  const [open, setOpen] = useState(false);
  const current = siteTranslationService.getCurrentLanguage();

  useEffect(() => {
    siteTranslationService.initSiteTranslation();
  }, []);

  if (variant === 'mobile') {
    return (
      <label className="notranslate flex items-center gap-2 font-nunito font-bold text-lg" style={{ color: 'var(--hero-ink)' }}>
        <Globe size={20} aria-hidden="true" />
        <span>Language</span>
        <select
          value={current.code}
          onChange={e => siteTranslationService.setLanguage(e.target.value)}
          className="bg-white border-[1.5px] border-[var(--hero-border)] rounded-full px-4 py-2 font-nunito font-bold text-base"
        >
          {SITE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
    );
  }

  return (
    <div className="notranslate" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Website language: ${current.label}`}
        title="Website language"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'white', border: '1.5px solid var(--hero-border)',
          borderRadius: 999, padding: '9px 14px', minHeight: 40, cursor: 'pointer',
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--hero-ink)',
          transition: 'border-color 200ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hero-green)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hero-border)'; }}
      >
        <Globe size={18} aria-hidden="true" />
        {current.short}
        <ChevronDown size={14} style={{ color: 'var(--hero-gray)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            aria-label="Choose website language"
            style={{
              position: 'absolute', right: 0, top: '115%', background: 'white',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(58,26,16,0.15)',
              minWidth: 210, maxHeight: 380, overflowY: 'auto', zIndex: 100,
              padding: '6px 0', margin: 0, listStyle: 'none',
              animation: 'menuIn 160ms ease-out',
            }}
          >
            <li style={{ padding: '6px 16px 8px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: 'var(--hero-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Website language
            </li>
            {SITE_LANGUAGES.map(lang => {
              const selected = lang.code === current.code;
              return (
                <li key={lang.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); siteTranslationService.setLanguage(lang.code); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      width: '100%', padding: '10px 16px', background: selected ? 'rgba(47,122,38,0.08)' : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'Nunito Sans', fontSize: 15,
                      color: selected ? 'var(--hero-green)' : 'var(--charcoal)', fontWeight: selected ? 700 : 400,
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'none'; }}
                  >
                    <span>{lang.label}</span>
                    {selected ? <Check size={16} aria-hidden="true" /> : <span style={{ fontSize: 12, color: 'var(--hero-gray)' }}>{lang.short}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
