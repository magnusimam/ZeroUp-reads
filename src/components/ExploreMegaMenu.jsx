import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { EXPLORE_MEGA_MENU } from '../config/navigation';

// Plain-style (inline styles + CSS vars) "Explore" nav item with a hover/tap
// dropdown of library shortcuts — sits alongside Navbar.jsx's other plain
// links, styled off the same --hero-* palette so it reads as one of them.
export default function ExploreMegaMenu({ icon }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 0',
          fontFamily: 'Nunito', fontWeight: 600, fontSize: 16,
          color: 'var(--hero-ink)',
          borderBottom: '2px solid transparent',
          transition: 'color 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--hero-green)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--hero-ink)'; }}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        Explore
        <ChevronDown size={15} strokeWidth={2.5} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 14, width: 480, maxWidth: '90vw',
            background: 'white', borderRadius: 20, boxShadow: '0 20px 48px rgba(58,26,16,0.22)',
            padding: 18, zIndex: 200, animation: 'popIn 180ms ease',
            border: '1px solid var(--hero-border)',
          }}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
          }}>
            {EXPLORE_MEGA_MENU.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 12px', borderRadius: 14, textDecoration: 'none',
                  transition: 'background 150ms ease, transform 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hero-cream)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span aria-hidden="true" style={{
                  fontSize: 22, width: 40, height: 40, borderRadius: 12,
                  background: 'var(--hero-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{item.icon}</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'Nunito', fontWeight: 800, fontSize: 14.5, color: 'var(--hero-ink)' }}>
                    {item.label}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'Nunito Sans', fontSize: 12.5, color: 'var(--hero-gray)', marginTop: 1 }}>
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
