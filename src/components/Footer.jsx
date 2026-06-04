import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const socialLinks = [
  { icon: '𝕏', label: 'Twitter', href: '#' },
  { icon: 'f', label: 'Facebook', href: '#' },
  { icon: 'in', label: 'Instagram', href: '#' },
];

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
      {/* Newsletter bar */}
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: 'var(--amber)' }}>📧 Get new books in your inbox:</span>
          {!subscribed ? (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  height: 40, padding: '0 14px', borderRadius: 8, border: 'none',
                  fontSize: 15, fontFamily: 'Nunito Sans', outline: 'none',
                  minWidth: 220,
                }}
              />
              <button type="submit" style={{
                height: 40, padding: '0 18px', background: 'var(--amber)',
                color: 'var(--navy)', border: 'none', borderRadius: 8,
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}>Subscribe</button>
            </form>
          ) : (
            <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 15 }}>✓ You're subscribed!</span>
          )}
        </div>
      </div>

      {/* Main footer columns */}
      <div className="container" style={{ padding: '56px 64px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
        }}>
          {/* Col 1: Logo + Mission */}
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
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 12, margin: '0 0 12px' }}>
              <em>Beyond Reading</em>
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
              Putting African-language books in the hands of every child — wherever they are.
            </p>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, marginBottom: 18, margin: '0 0 18px' }}>Explore</h4>
            {[
              { to: '/library', label: 'Library' },
              { to: '/about',   label: 'About Us' },
              { to: '/privacy', label: 'Privacy Policy' },
              { to: '/terms',   label: 'Terms & Conditions' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block', marginBottom: 10,
                color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                fontSize: 15, fontFamily: 'Nunito Sans',
                transition: 'color 200ms ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >{link.label}</Link>
            ))}
          </div>

          {/* Col 3: Social + Contact */}
          <div>
            <h4 style={{ color: 'var(--amber)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, marginBottom: 18, margin: '0 0 18px' }}>Connect</h4>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {socialLinks.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'background 200ms ease, color 200ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--navy)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                >{s.icon}</a>
              ))}
            </div>
            <a href="mailto:hello@zeroupreads.com" style={{ color: 'var(--amber)', textDecoration: 'none', fontSize: 15, fontFamily: 'Nunito' }}>
              hello@zeroupreads.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Nunito Sans' }}>
            © 2025 ZeroUp Reads. No ads. No data sold. Child-safe.
          </p>
        </div>
      </div>
    </footer>
  );
}
