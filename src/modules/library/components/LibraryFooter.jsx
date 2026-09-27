import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SOCIAL = [
  { icon: '𝕏', label: 'Twitter', href: '#' },
  { icon: 'f', label: 'Facebook', href: '#' },
  { icon: 'in', label: 'Instagram', href: '#' },
];

const PROGRAMS = [
  { label: 'Mission', href: '#' },
  { label: 'Scholarships', href: '#' },
  { label: 'Events', href: '#' },
];

const LEGAL = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Accessibility', href: '#' },
];

export default function LibraryFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t border-[var(--hero-border)]" style={{ background: 'linear-gradient(180deg, var(--hero-cream) 0%, #FFF3E9 100%)' }}>
      <div className="max-w-content mx-auto w-full px-4 sm:px-6 pt-10 pb-2 text-center">
        <p className="font-nunito-sans italic text-sm" style={{ color: 'var(--hero-gray)' }}>
          More stories today. A brighter Africa tomorrow. <span aria-hidden="true">🤍</span>
        </p>
      </div>

      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Branding */}
        <div>
          <p className="font-nunito font-extrabold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--hero-ink)' }}>
            <span aria-hidden="true">📚</span> ZeroUp Reads
          </p>
          <p className="font-nunito-sans text-sm leading-relaxed mb-5" style={{ color: 'var(--hero-gray)' }}>
            Bridging imagination and education, one story at a time. 🌈
          </p>
          <div className="flex gap-3">
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full border bg-white flex items-center justify-center text-sm hover:scale-110 transition-all"
                style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-gray)' }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div>
          <h4 className="font-nunito font-bold text-sm mb-4" style={{ color: 'var(--hero-ink)' }}>Programs</h4>
          <div className="flex flex-col gap-3">
            {PROGRAMS.map(l => (
              <a key={l.label} href={l.href} className="font-nunito-sans text-sm hover:underline" style={{ color: 'var(--hero-gray)' }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-nunito font-bold text-sm mb-4" style={{ color: 'var(--hero-ink)' }}>Legal</h4>
          <div className="flex flex-col gap-3">
            {LEGAL.map(l => (
              l.to ? (
                <Link key={l.label} to={l.to} className="font-nunito-sans text-sm hover:underline" style={{ color: 'var(--hero-gray)' }}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="font-nunito-sans text-sm hover:underline" style={{ color: 'var(--hero-gray)' }}>
                  {l.label}
                </a>
              )
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-nunito font-bold text-sm mb-4" style={{ color: 'var(--hero-ink)' }}>Newsletter</h4>
          {subscribed ? (
            <p className="text-sm font-nunito font-bold" style={{ color: 'var(--hero-green)' }}>🎉 You're subscribed!</p>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white border text-sm focus:outline-none"
                style={{ borderColor: 'var(--hero-border)', color: 'var(--hero-ink)' }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white font-nunito font-bold text-sm shrink-0 hover:opacity-90 transition-opacity"
                style={{ background: 'var(--hero-orange)' }}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--hero-border)] py-5 flex items-center justify-center gap-4 flex-wrap px-4">
        <p className="font-nunito-sans text-xs" style={{ color: 'var(--hero-gray)' }}>
          © 2026 ZeroUp Reads. No ads. No data sold. Child-safe. 🛡️
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-nunito font-bold"
          style={{ background: 'var(--hero-ink)' }}
        >
          Back to Top ↑
        </button>
      </div>
    </footer>
  );
}
