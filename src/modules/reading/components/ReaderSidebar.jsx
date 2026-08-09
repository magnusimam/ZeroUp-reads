import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { NAV_ITEMS, BookLogoIcon } from '../../dashboard/components/DashboardSidebar';

// Reading Page's left nav — reuses the exact same NAV_ITEMS/logo the Reader
// Dashboard sidebar already defines (Modular Architecture: one nav list, one
// source of truth) but swaps the bottom "keep reading" tip box for two stat
// cards (streak + reading points), matching this page's own reference design.
export default function ReaderSidebar({ streak, points }) {
  const location = useLocation();
  const currentPath = location.pathname + location.hash;

  return (
    <aside className="reader-sidebar" style={{
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          background: '#FFF3EE', border: '1px solid #FBD9CB', borderRadius: 18,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--hero-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Flame size={18} color="white" fill="white" />
          </span>
          <div>
            <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--hero-ink)' }}>{streak}</p>
            <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 12, color: 'var(--hero-gray)' }}>
              Day Streak<br />Keep it up!
            </p>
          </div>
        </div>

        <div style={{
          background: '#FFF8E6', border: '1px solid #F5E1A8', borderRadius: 18,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', background: '#E8A020',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Star size={18} color="white" fill="white" />
          </span>
          <div>
            <p style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--hero-ink)' }}>{points}</p>
            <p style={{ margin: 0, fontFamily: 'Nunito Sans', fontSize: 12, color: 'var(--hero-gray)' }}>
              Reading Points<br />Great job!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
