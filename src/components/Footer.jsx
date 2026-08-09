import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const socialLinks = [
  { code: 'FB', label: 'Facebook', href: '#' },
  { code: 'X', label: 'Twitter', href: '#' },
  { code: 'IG', label: 'Instagram', href: '#' },
  { code: 'YT', label: 'YouTube', href: '#' },
  { code: 'TT', label: 'TikTok', href: '#' },
];

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/library', label: 'Explore' },
  { to: '/library', label: 'Languages' },
  { to: '/library', label: 'Books' },
  { to: '/about', label: 'About Us' },
  { to: 'mailto:hello@zeroupreads.com', label: 'Contact', external: true },
];

const RESOURCE_LINKS = [
  { to: '#', label: 'For Teachers' },
  { to: '#', label: 'For Parents' },
  { to: '/help', label: 'Help Center' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
];

const linkStyle = {
  display: 'block', marginBottom: 10,
  color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
  fontSize: 15, fontFamily: 'Nunito Sans',
  transition: 'color 200ms ease',
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{
      background: 'var(--navy)',
      borderTop: '4px solid var(--amber)',
      color: 'white',
      fontFamily: 'Nunito Sans, sans-serif',
    }}>
      {/* Main footer columns */}
      <div className="container" style={{ padding: '56px 64px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
        }}>
          {/* Col 1: Logo + Mission + Social */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'var(--navy)', fontFamily: 'Nunito', fontWeight: 900, fontSize: 18 }}>ZR</span>
              </div>
              <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20 }}>
                ZeroUp <span style={{ color: 'var(--amber)' }}>Reads</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 20px' }}>
              Unlocking literacy across Africa through AI-powered multilingual content.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700,
                  fontFamily: 'Nunito', textDecoration: 'none',
                  transition: 'background 200ms ease, color 200ms ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--navy)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                >{s.code}</a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, margin: '0 0 18px' }}>Quick Links</h4>
            {QUICK_LINKS.map((link) =>
              link.external ? (
                <a key={link.label} href={link.to} style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                >{link.label}</a>
              ) : (
                <Link key={link.label} to={link.to} style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                >{link.label}</Link>
              )
            )}
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, margin: '0 0 18px' }}>Resources</h4>
            {RESOURCE_LINKS.map((link) => (
              <Link key={link.label} to={link.to} style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--amber)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >{link.label}</Link>
            ))}
          </div>

          {/* Col 4: Stay Updated */}
          <div>
            <h4 style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, margin: '0 0 18px' }}>Stay Updated</h4>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 14px' }}>
              Get new books, updates and learning tips.
            </p>
            {!subscribed ? (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
              >
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  style={{
                    flex: '1 1 140px', height: 42, padding: '0 14px', borderRadius: 8, border: 'none',
                    fontSize: 14, fontFamily: 'Nunito Sans', outline: 'none',
                  }}
                />
                <button type="submit" style={{
                  height: 42, padding: '0 18px', background: 'var(--amber)',
                  color: 'var(--navy)', border: 'none', borderRadius: 8,
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>Subscribe</button>
              </form>
            ) : (
              <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>✓ You're subscribed!</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Nunito Sans' }}>
            © 2026 ZeroUp Reads. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Nunito Sans' }}>
            Made with ❤️ for every African child.
          </p>
        </div>
      </div>
    </footer>
  );
}
