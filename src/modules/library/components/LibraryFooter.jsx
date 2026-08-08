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
    <footer className="border-t-4 border-gold/25 bg-gradient-to-b from-[#FFF6E0] to-[#FFF0E6]">
      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Branding */}
        <div>
          <p className="font-playfair font-bold text-cocoa text-lg mb-3 flex items-center gap-2">
            <span aria-hidden="true">📚</span> ZeroUp Reads
          </p>
          <p className="font-nunito-sans text-charcoal/50 text-sm leading-relaxed mb-5">
            Bridging imagination and education, one story at a time. 🌈
          </p>
          <div className="flex gap-3">
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full border-2 border-gold/30 bg-white flex items-center justify-center text-charcoal/70 text-sm hover:border-coral hover:text-coral hover:scale-110 transition-all"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div>
          <h4 className="font-nunito font-bold text-cocoa text-sm mb-4">Programs</h4>
          <div className="flex flex-col gap-3">
            {PROGRAMS.map(l => (
              <a key={l.label} href={l.href} className="font-nunito-sans text-charcoal/50 text-sm hover:text-cocoa transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-nunito font-bold text-cocoa text-sm mb-4">Legal</h4>
          <div className="flex flex-col gap-3">
            {LEGAL.map(l => (
              l.to ? (
                <Link key={l.label} to={l.to} className="font-nunito-sans text-charcoal/50 text-sm hover:text-cocoa transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="font-nunito-sans text-charcoal/50 text-sm hover:text-cocoa transition-colors">
                  {l.label}
                </a>
              )
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-nunito font-bold text-cocoa text-sm mb-4">Newsletter</h4>
          {subscribed ? (
            <p className="text-green text-sm font-nunito font-bold">🎉 You're subscribed!</p>
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
                className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white border-2 border-gold/20 text-charcoal text-sm placeholder-charcoal/30 focus:outline-none focus:border-coral"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-coral text-white font-nunito font-bold text-sm shrink-0 hover:opacity-90 transition-opacity"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-gold/15 py-5 text-center">
        <p className="font-nunito-sans text-charcoal/40 text-xs">
          © 2026 ZeroUp Reads. No ads. No data sold. Child-safe. 🛡️
        </p>
      </div>
    </footer>
  );
}
