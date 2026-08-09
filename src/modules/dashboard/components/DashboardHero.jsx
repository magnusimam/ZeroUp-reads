import React from 'react';
import { Link } from 'react-router-dom';

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

// "Continue Reading" hero — matches the reference dashboard mockup exactly:
// the reading-under-the-stars photo fills the card as a full-bleed
// background (its own night sky doubles as the dark backdrop the greeting
// sits on) instead of a separate illustration + gradient.
export default function DashboardHero({ firstName, continueBook }) {
  const continueHref = continueBook ? `/read/${continueBook.id}` : '/library';

  return (
    <section style={{
      position: 'relative', overflow: 'hidden', borderRadius: 28,
      minHeight: 220, display: 'flex', alignItems: 'center',
      background: 'var(--deep-navy)',
    }}>
      <img
        src="/images/dashboard-hero-boy-reading.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'right center', zIndex: 0,
        }}
      />
      {/* Left-side scrim so the greeting stays legible even if the photo's
          own dark sky doesn't cover enough of the card at a given width. */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(90deg, rgba(15,22,41,0.88) 0%, rgba(15,22,41,0.6) 45%, rgba(15,22,41,0) 72%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 380, padding: '32px' }}>
        <h1 style={{
          margin: 0, fontFamily: 'Nunito', fontWeight: 800, fontSize: 30, color: 'white', lineHeight: 1.25,
        }}>
          {timeOfDayGreeting()}, {firstName}! <span aria-hidden="true">👋</span>
        </h1>
        <p style={{ margin: '10px 0 22px', fontFamily: 'Nunito Sans', fontSize: 16, color: 'rgba(255,255,255,0.75)' }}>
          Let's explore something amazing today.
        </p>
        <Link to={continueHref} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--hero-orange)', color: 'white',
          borderRadius: 999, padding: '13px 24px', textDecoration: 'none',
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 15,
        }}>▶ Continue Reading</Link>
      </div>
    </section>
  );
}
