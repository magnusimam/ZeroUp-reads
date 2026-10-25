import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { EXPLORE_MEGA_MENU } from '../config/navigation';

// How long the pointer may be outside the menu before it closes — lets the
// pointer travel from the button down into the panel without it vanishing.
const HOVER_CLOSE_DELAY_MS = 180;

// Plain-style (inline styles + CSS vars) "Explore" nav item with a hover/tap
// dropdown of library shortcuts — sits alongside Navbar.jsx's other plain
// links, styled off the same --hero-* palette so it reads as one of them.
//
// Hover previews the menu; a click pins it open (a second click closes it),
// so a click right after hovering no longer snaps it shut. Outside click,
// Escape and navigating away all close it.
export default function ExploreMegaMenu({ icon }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef(null);
  const closeTimer = useRef(null);
  const location = useLocation();

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(false);
    setPinned(false);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => { close(); }, [location, close]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = e => { if (!rootRef.current?.contains(e.target)) close(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  function handleMouseEnter() {
    cancelClose();
    setOpen(true);
  }

  function handleMouseLeave() {
    if (pinned) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }

  function handleClick() {
    cancelClose();
    if (open && pinned) {
      close();
    } else {
      setOpen(true);
      setPinned(true);
    }
  }

  return (
    <div
      ref={rootRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 0',
          fontFamily: 'Nunito', fontWeight: 600, fontSize: 16,
          color: open ? 'var(--hero-green)' : 'var(--hero-ink)',
          borderBottom: '2px solid transparent',
          transition: 'color 200ms ease',
        }}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        Explore
        <ChevronDown size={15} strokeWidth={2.5} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
      </button>

      {open && (
        // Outer box only positions (centred under the button) and its
        // paddingTop is an invisible hover bridge across the gap. The panel's
        // animation lives on the inner box so its transform can't fight the
        // centring translateX — that clash is what made the menu jump.
        <div
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            paddingTop: 14, width: 480, maxWidth: '90vw', zIndex: 200,
          }}
        >
          <div
            role="menu"
            style={{
              background: 'white', borderRadius: 20, boxShadow: '0 20px 48px rgba(58,26,16,0.22)',
              padding: 18, animation: 'menuIn 160ms ease-out',
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
                  role="menuitem"
                  onClick={close}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 12px', borderRadius: 14, textDecoration: 'none',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hero-cream)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
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
        </div>
      )}
    </div>
  );
}
