import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Route (+ optional hash) each sidebar item resolves to. Exported so ReaderSidebar (src/modules/reading) reuses the same nav list
// instead of maintaining a second, driftable copy (Modular Architecture).
export const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', to: '/dashboard' },
  { label: 'My Library', icon: '📚', to: '/library' },
  { label: 'Categories', icon: '🗂️', to: '/dashboard#categories' },
  { label: 'Favourites', icon: '❤️', to: '/profile#bookmarks' },
  { label: 'Achievements', icon: '🏆', to: '/dashboard#progress' },
  { label: 'My Progress', icon: '📈', to: '/dashboard#progress' },
  { label: 'Downloads', icon: '⬇️', to: '/downloads' },
  { label: 'Profile', icon: '👤', to: '/profile' },
  { label: 'Settings', icon: '⚙️', to: '/settings' },
];

export function BookLogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M18 9 C14 6 8 6 4 8 V27 C8 25 14 25 18 28 Z" fill="#2D6BE4" stroke="#3A1A10" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 9 C22 6 28 6 32 8 V27 C28 25 22 25 18 28 Z" fill="var(--hero-orange)" stroke="#3A1A10" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 9 V28" stroke="#3A1A10" strokeWidth="1.2" />
    </svg>
  );
}

// Phone/tablet replacement for the sidebar (≤900px, where the 240px column
// would otherwise stack above the whole page): the same NAV_ITEMS as one
// horizontally scrollable row of pills. Hidden on wider screens via CSS.
export function DashboardMobileNav() {
  const location = useLocation();
  const currentPath = location.pathname + location.hash;

  return (
    <nav className="dashboard-mobile-nav" aria-label="Dashboard" style={{
      display: 'none', gap: 8, overflowX: 'auto', padding: '2px 2px 6px',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.label === 'Dashboard'
          ? (location.pathname === '/dashboard' && !location.hash)
          : currentPath === item.to;
        return (
          <Link
            key={item.label}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              background: isActive ? 'var(--hero-orange)' : 'white',
              color: isActive ? 'white' : 'var(--hero-ink)',
              border: `1px solid ${isActive ? 'var(--hero-orange)' : 'var(--hero-border)'}`,
            }}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar({ streak }) {
  const location = useLocation();
  const currentPath = location.pathname + location.hash;

  return (
    <aside className="dashboard-sidebar" style={{
      width: 240, flexShrink: 0,
      background: 'white', borderRadius: 28,
      border: '1px solid var(--hero-border)',
      padding: 20, height: 'fit-content',
      display: 'flex', flexDirection: 'column', gap: 22,
      position: 'sticky', top: 20,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <BookLogoIcon />
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, lineHeight: 1.05 }}>
          <span style={{ color: 'var(--hero-green)' }}>ZeroUp</span><br />
          <span style={{ color: 'var(--hero-orange)' }}>Reads</span>
        </div>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === 'Dashboard'
            ? (location.pathname === '/dashboard' && !location.hash)
            : currentPath === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 14,
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 15,
                textDecoration: 'none',
                background: isActive ? 'var(--hero-orange)' : 'transparent',
                color: isActive ? 'white' : 'var(--hero-ink)',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FFF3EE'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        background: '#FFF3EE', border: '1px solid #FBD9CB',
        borderRadius: 18, padding: '16px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <span style={{ fontSize: 22 }} aria-hidden="true">📖</span>
        <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--hero-ink)' }}>
          Keep reading,<br />Keep growing!
        </p>
        {streak > 0 && (
          <p style={{ margin: '4px 0 0', fontFamily: 'Nunito Sans', fontSize: 12, color: 'var(--hero-orange)', fontWeight: 700 }}>
            🔥 {streak}-day streak
          </p>
        )}
      </div>
    </aside>
  );
}
