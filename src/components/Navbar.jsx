import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';

// Open-book logo icon — blue pages, orange/red cover, matches the source design
function BookLogoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M18 9 C14 6 8 6 4 8 V27 C8 25 14 25 18 28 Z" fill="#2D6BE4" stroke="#3A1A10" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 9 C22 6 28 6 32 8 V27 C28 25 22 25 18 28 Z" fill="var(--hero-orange)" stroke="#3A1A10" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 9 V28" stroke="#3A1A10" strokeWidth="1.2" />
      <path d="M7 13 H15 M7 17 H15 M7 21 H14" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 13 H29 M21 17 H29 M22 21 H29" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <BookLogoIcon />
      <div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
          <span style={{ color: 'var(--hero-green)' }}>ZeroUp</span>{' '}
          <span style={{ color: 'var(--hero-orange)' }}>Reads</span>
        </div>
        <div style={{ fontFamily: 'Nunito Sans', fontSize: 11, color: 'var(--hero-gray)', letterSpacing: '0.1px' }}>
          Every Child. Every Language. Every Story.
        </div>
      </div>
    </div>
  );
}

function AvatarDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const initial = user.name ? user.name[0].toUpperCase() : 'U';
  const colours = ['#2F7A26', '#2D6BE4', '#E5533D', '#E8A020', '#3DBE8A'];
  const bg = colours[user.name.charCodeAt(0) % colours.length];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'none',
          border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 99,
          transition: 'background 200ms',
          minWidth: 44, minHeight: 44,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(47,122,38,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
        }}>{initial}</div>
        {user.role === 'admin' && (
          <span style={{
            background: 'var(--hero-orange)', color: 'white', fontSize: 11,
            fontWeight: 700, borderRadius: 99, padding: '2px 8px',
            fontFamily: 'Nunito',
          }}>Admin</span>
        )}
        <span style={{ fontSize: 12, color: 'var(--hero-gray)' }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '110%', background: 'white',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(58,26,16,0.15)',
            minWidth: 180, overflow: 'hidden', zIndex: 100,
            animation: 'fadeIn 150ms ease',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--hero-ink)' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--hero-gray)' }}>{user.email}</div>
            </div>
            <Link to="/profile" onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '12px 16px', color: 'var(--charcoal)', textDecoration: 'none', fontSize: 15, fontFamily: 'Nunito Sans' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >👤 My Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '12px 16px', color: 'var(--charcoal)', textDecoration: 'none', fontSize: 15, fontFamily: 'Nunito Sans' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >⚙️ Admin Dashboard</Link>
            )}
            <button onClick={() => { logout(); setOpen(false); navigate('/'); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 16px', color: 'var(--coral)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'Nunito Sans',
                borderTop: '1px solid #f0f0f0',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >🚪 Log out</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/',                     label: 'Home',      icon: '🏠' },
    { to: '/library',              label: 'Explore',   icon: '🔍' },
    { to: '/library',              label: 'Languages', icon: '🌐' },
    { to: '/library?type=story',   label: 'Stories',   icon: '📖' },
    { to: '/about',                label: 'About',     icon: '❓' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 76,
        background: 'var(--hero-cream)',
        boxShadow: '0 2px 16px rgba(58,26,16,0.08)',
        animation: mounted ? 'slideDown 400ms ease' : 'none',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          {/* Centre links — desktop */}
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden-mobile">
            {navLinks.map((link, i) => {
              const isHome = link.label === 'Home' && location.pathname === '/';
              return (
                <Link key={link.label + i} to={link.to} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Nunito', fontWeight: isHome ? 800 : 600, fontSize: 16,
                  color: isHome ? 'var(--hero-green)' : 'var(--hero-ink)',
                  textDecoration: 'none', padding: '6px 0',
                  borderBottom: isHome ? '2px solid var(--hero-green)' : '2px solid transparent',
                  transition: 'color 200ms ease, border-color 200ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--hero-green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isHome ? 'var(--hero-green)' : 'var(--hero-ink)'; }}
                ><span aria-hidden="true">{link.icon}</span>{link.label}</Link>
              );
            })}
          </div>

          {/* Right side — desktop */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="hidden-mobile">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'white', border: '1.5px solid var(--hero-border)',
              borderRadius: 999, padding: '9px 14px',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--hero-ink)',
            }}>🌐 EN <span style={{ fontSize: 11, color: 'var(--hero-gray)' }}>▾</span></div>

            {user ? (
              <AvatarDropdown user={user} logout={logout} />
            ) : (
              <>
                <Link to="/login" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 15,
                  color: 'var(--hero-ink)', background: 'white',
                  border: '1.5px solid var(--hero-border)',
                  borderRadius: 999, padding: '9px 18px', textDecoration: 'none',
                  transition: 'all 200ms ease', minHeight: 40,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hero-green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hero-border)'; }}
                >👤 Login</Link>
                <Link to="/register" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 15,
                  background: 'var(--hero-green)', color: 'white',
                  borderRadius: 999, padding: '9px 20px', textDecoration: 'none',
                  transition: 'all 200ms ease', minHeight: 40,
                  border: '1.5px solid var(--hero-green)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >⭐ Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="show-mobile"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 44, height: 44, display: 'none',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: 8,
            }}
            aria-label="Open menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2.5,
                background: 'var(--hero-green)',
                borderRadius: 2, transition: 'all 300ms ease',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                  : 'scaleX(0)'
                  : 'none',
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'var(--hero-cream)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 28,
          animation: 'fadeIn 200ms ease',
        }}>
          {navLinks.map((link, i) => (
            <Link key={link.label + i} to={link.to} style={{
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 26, color: 'var(--hero-ink)',
              textDecoration: 'none', padding: 8, display: 'flex', alignItems: 'center', gap: 10,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--hero-green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--hero-ink)'}
            ><span aria-hidden="true">{link.icon}</span>{link.label}</Link>
          ))}
          <div style={{ height: 1, width: 60, background: 'var(--hero-border)' }} />
          {user ? (
            <>
              <Link to="/profile" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--hero-ink)', textDecoration: 'none' }}>My Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--hero-ink)', textDecoration: 'none' }}>👤 Login</Link>
              <Link to="/register" style={{
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
                background: 'var(--hero-green)', color: 'white',
                borderRadius: 999, padding: '12px 32px', textDecoration: 'none',
              }}>⭐ Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
