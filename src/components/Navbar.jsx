import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ZR Logo icon SVG
function ZRLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 900, fontSize: 18, letterSpacing: '-1px' }}>ZR</span>
      </div>
      <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', letterSpacing: '-0.3px' }}>
        ZeroUp <span style={{ color: 'var(--amber)' }}>Reads</span>
      </span>
    </div>
  );
}

function AvatarDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const initial = user.name ? user.name[0].toUpperCase() : 'U';
  const colours = ['#1F3D6E','#3DBE8A','#2D6BE4','#E8A020','#FF6B6B'];
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
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(31,61,110,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
        }}>{initial}</div>
        {user.role === 'admin' && (
          <span style={{
            background: 'var(--amber)', color: 'var(--navy)', fontSize: 11,
            fontWeight: 700, borderRadius: 99, padding: '2px 8px',
            fontFamily: 'Nunito',
          }}>Admin</span>
        )}
        <span style={{ fontSize: 12, color: '#888' }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '110%', background: 'white',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(31,61,110,0.15)',
            minWidth: 180, overflow: 'hidden', zIndex: 100,
            animation: 'fadeIn 150ms ease',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{user.email}</div>
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

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isTransparent = transparent && !scrolled;

  const navLinks = [
    { to: '/library', label: 'Library' },
    { to: '/about',   label: 'About'   },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 72,
        background: isTransparent ? 'transparent' : 'white',
        boxShadow: isTransparent ? 'none' : '0 2px 16px rgba(31,61,110,0.08)',
        transition: 'background-color 300ms ease, box-shadow 300ms ease',
        animation: mounted ? 'slideDown 400ms ease' : 'none',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: isTransparent ? 'white' : 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 300ms ease',
              }}>
                <span style={{ color: isTransparent ? 'var(--navy)' : 'var(--amber)', fontFamily: 'Nunito', fontWeight: 900, fontSize: 18 }}>ZR</span>
              </div>
              <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: isTransparent ? 'white' : 'var(--navy)', transition: 'color 300ms ease' }}>
                ZeroUp <span style={{ color: 'var(--amber)' }}>Reads</span>
              </span>
            </div>
          </Link>

          {/* Centre links — desktop */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden-mobile">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                fontFamily: 'Nunito', fontWeight: 600, fontSize: 18,
                color: isTransparent ? 'white' : 'var(--charcoal)',
                textDecoration: 'none', padding: '4px 0',
                borderBottom: '2px solid transparent',
                transition: 'color 200ms ease, border-color 200ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--amber)'; e.currentTarget.style.borderBottomColor = 'var(--amber)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = isTransparent ? 'white' : 'var(--charcoal)'; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >{link.label}</Link>
            ))}
          </div>

          {/* Right side — desktop */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="hidden-mobile">
            {user ? (
              <AvatarDropdown user={user} logout={logout} />
            ) : (
              <>
                <Link to="/login" style={{
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
                  color: isTransparent ? 'white' : 'var(--navy)',
                  border: `2px solid ${isTransparent ? 'white' : 'var(--navy)'}`,
                  borderRadius: 12, padding: '8px 20px', textDecoration: 'none',
                  transition: 'all 200ms ease', minHeight: 44, display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = isTransparent ? 'white' : 'var(--navy)'; e.currentTarget.style.color = isTransparent ? 'var(--navy)' : 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isTransparent ? 'white' : 'var(--navy)'; }}
                >Log in</Link>
                <Link to="/register" style={{
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
                  background: isTransparent ? 'white' : 'var(--navy)', color: isTransparent ? 'var(--navy)' : 'white',
                  borderRadius: 12, padding: '8px 20px', textDecoration: 'none',
                  transition: 'all 200ms ease', minHeight: 44, display: 'flex', alignItems: 'center',
                  border: '2px solid transparent',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--navy)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isTransparent ? 'white' : 'var(--navy)'; e.currentTarget.style.color = isTransparent ? 'var(--navy)' : 'white'; }}
                >Register</Link>
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
                background: isTransparent ? 'white' : 'var(--navy)',
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
          background: 'var(--navy)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 32,
          animation: 'fadeIn 200ms ease',
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 28, color: 'white',
              textDecoration: 'none', padding: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
              onMouseLeave={e => e.currentTarget.style.color = 'white'}
            >{link.label}</Link>
          ))}
          <div style={{ height: 1, width: 60, background: 'rgba(255,255,255,0.2)' }} />
          {user ? (
            <>
              <Link to="/profile" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22, color: 'white', textDecoration: 'none' }}>My Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22, color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22, color: 'var(--amber)', textDecoration: 'none' }}>Log in</Link>
              <Link to="/register" style={{
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 20,
                background: 'var(--amber)', color: 'var(--navy)',
                borderRadius: 12, padding: '12px 32px', textDecoration: 'none',
              }}>Register Free</Link>
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
