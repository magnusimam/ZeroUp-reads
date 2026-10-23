import React from 'react';
import { Link } from 'react-router-dom';
import { BOOK_LANGUAGES } from '../../../utils/mockData';

const FONT_SIZES = [
  { label: 'Small', value: 14 },
  { label: 'Medium', value: 18 },
  { label: 'Large', value: 24 },
];

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>{label}</p>
        {desc && <p className="font-nunito-sans text-xs mt-0.5" style={{ color: 'var(--hero-gray)' }}>{desc}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors shrink-0"
        style={{ background: checked ? 'var(--hero-green)' : 'rgba(0,0,0,0.15)' }}
      >
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

export default function SettingsTab({ settings, updateSettings, onboardingPrefs, onLogout }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border p-5 flex flex-col gap-5" style={{ borderColor: 'var(--hero-border)' }}>
        <div>
          <h3 className="font-nunito font-extrabold text-[15px]" style={{ color: 'var(--hero-ink)' }}>Preferred reading language</h3>
          <p className="font-nunito-sans text-xs mt-1 mb-3" style={{ color: 'var(--hero-gray)' }}>Used when you start a new story.</p>
          <select
            value={settings.preferredLanguage}
            onChange={e => updateSettings({ preferredLanguage: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-nunito-sans focus:outline-none"
            style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
          >
            <option value="">No preference</option>
            {BOOK_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <h3 className="font-nunito font-extrabold text-[15px]" style={{ color: 'var(--hero-ink)' }}>Default reading text size</h3>
          <p className="font-nunito-sans text-xs mt-1 mb-3" style={{ color: 'var(--hero-gray)' }}>Applied when you open a book in the reader.</p>
          <div className="flex gap-2">
            {FONT_SIZES.map(size => (
              <button
                key={size.value}
                onClick={() => updateSettings({ readerFontSize: size.value })}
                className="px-4 py-2 rounded-full border text-sm font-nunito font-bold"
                style={
                  settings.readerFontSize === size.value
                    ? { background: 'var(--sky-blue, #2D6BE4)', borderColor: 'var(--sky-blue, #2D6BE4)', color: 'white' }
                    : { borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }
                }
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-2" style={{ borderColor: 'var(--hero-border)' }}>
          <ToggleRow
            label="Night mode while reading"
            checked={settings.readerNightMode}
            onChange={v => updateSettings({ readerNightMode: v })}
          />
          <ToggleRow
            label="Notifications"
            desc="Let ZeroUp Reads notify you about new activity."
            checked={settings.notificationsEnabled !== false}
            onChange={v => updateSettings({ notificationsEnabled: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--hero-border)' }}>
          <h3 className="font-nunito font-extrabold text-[15px] mb-1" style={{ color: 'var(--hero-ink)' }}>Your reading preferences</h3>
          <p className="font-nunito-sans text-xs mb-4" style={{ color: 'var(--hero-gray)' }}>
            Set the first time you signed in, from the welcome quiz.
          </p>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--hero-border)' }}>
            <div className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>Reading level</span>
              <span className="font-nunito font-bold text-sm" style={{ color: 'var(--hero-ink)' }}>{onboardingPrefs.level || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-nunito-sans text-sm" style={{ color: 'var(--hero-gray)' }}>Languages</span>
              <span className="font-nunito font-bold text-sm text-right" style={{ color: 'var(--hero-ink)' }}>{onboardingPrefs.languages?.join(', ') || 'Not set'}</span>
            </div>
          </div>
          <Link to="/welcome" className="inline-block mt-4 font-nunito font-bold text-sm hover:underline" style={{ color: 'var(--sky-blue, #2D6BE4)' }}>
            Retake the welcome quiz →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--hero-border)' }}>
          <h3 className="font-nunito font-extrabold text-[15px] mb-3" style={{ color: 'var(--hero-ink)' }}>Account</h3>
          <button
            onClick={onLogout}
            className="w-full px-5 py-3 rounded-xl border font-nunito font-bold text-sm"
            style={{ borderColor: '#FBD5D5', color: 'var(--coral, #FF6B6B)' }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
