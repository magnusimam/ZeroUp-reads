import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Route (+ optional hash) each sidebar item resolves to. "Downloads" points
// at OfflinePage — the closest existing stub route — rather than a dead
// link, since a dedicated offline-downloads feature doesn't exist yet.
// Exported so ReaderSidebar (src/modules/reading) reuses the same nav list
// instead of maintaining a second, driftable copy (Modular Architecture).
export const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', to: '/dashboard' },
  { label: 'My Library', icon: '📚', to: '/library' },
  { label: 'Categories', icon: '🗂️', to: '/dashboard#categories' },
  { label: 'Favourites', icon: '❤️', to: '/profile#bookmarks' },
  { label: 'Achievements', icon: '🏆', to: '/dashboard#progress' },
  { label: 'My Progress', icon: '📈', to: '/dashboard#progress' },
  { label: 'Downloads', icon: '⬇️', to: '/offline' },
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
