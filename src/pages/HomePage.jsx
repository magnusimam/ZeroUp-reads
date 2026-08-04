import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../modules/auth/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import * as booksService from '../modules/books/booksService';
import FloatingShapes from '../components/home/FloatingShapes';
import StatItem from '../components/home/StatItem';
import BookCarousel from '../components/home/BookCarousel';
import LanguageCard from '../components/home/LanguageCard';
import FeatureCard from '../components/home/FeatureCard';
import HowStep from '../components/home/HowStep';
import ContinueReadingBanner from '../components/home/ContinueReadingBanner';
import AnnouncementSlider from '../components/home/AnnouncementSlider';
import WhatYouCanDo from '../components/home/WhatYouCanDo';

export default function HomePage() {
  const { user } = useAuth();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [howRef, howVisible] = useScrollReveal(0.1);
  const [books] = useState(() => booksService.getBooks());

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* ── HERO SECTION ──────────────────────────────────────── */
  const languages = [
    { flag: 'https://flagcdn.com/w40/gb.png', name: 'English' },
    { flag: 'https://flagcdn.com/w40/ke.png', name: 'Swahili' },
    { flag: 'https://flagcdn.com/w40/ng.png', name: 'Yoruba' },
    { flag: 'https://flagcdn.com/w40/ng.png', name: 'Igbo' },
    { flag: 'https://flagcdn.com/w40/ng.png', name: 'Pidgin' },
    { flag: 'https://flagcdn.com/w40/za.png', name: 'Zulu' },
    { flag: 'https://flagcdn.com/w40/fr.png', name: 'French' },
    { flag: 'https://flagcdn.com/w40/sn.png', name: 'Hausa' },

    
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Navbar — transparent over hero */}
      <Navbar transparent />

      {/* ANNOUNCEMENT SLIDER */}
      <AnnouncementSlider />


  
      {/* ── SECTION 2: HERO ────────────────────────────────── */}
      <section style={{
        background: 'var(--gradient-hero)',
        minHeight: '90vh',
        position: 'relative',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        <FloatingShapes />

        <div className="container" style={{
          position: 'relative', zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
          padding: '80px 64px',
        }}>
          {/* Left column */}
          <div>
            {/* Eyebrow badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--amber)', color: 'var(--navy)',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
              borderRadius: 99, padding: '6px 14px', marginBottom: 24,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(10px)',
              transition: 'all 400ms ease',
            }}>📚 Free for all children</div>

            {/* H1 */}
            <h1 style={{
              fontFamily: 'Nunito', fontWeight: 900, color: 'white',
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1.15, margin: '0 0 20px',
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(20px)',
              transition: 'all 500ms ease 100ms',
            }}>
              Read stories in{' '}
              <span style={{ color: 'var(--amber)' }}>your</span>{' '}
              language
            </h1>

            {/* Subheading */}
            <p style={{
              color: 'rgba(255,255,255,0.9)', fontSize: 20, fontWeight: 400,
              maxWidth: 480, margin: '0 0 28px', lineHeight: 1.65,
              fontFamily: 'Nunito Sans',
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(20px)',
              transition: 'all 500ms ease 200ms',
            }}>
              Explore hundreds of African-language books. Read anywhere — even without internet.
            </p>

            {/* Language flags row */}
            <div style={{
              display: 'flex', gap: 20, marginBottom: 36, flexWrap: 'wrap',
              opacity: heroLoaded ? 1 : 0,
              transition: 'opacity 400ms ease 300ms',
            }}>
              {languages.map((lang, i) => (
                <div key={lang.name} style={{
                  display:'flex',
                  flexDirection: 'column',
                  alignItems:'center',
                  gap:4,
                }}>
                  <img
                  src={lang.flag}
                  alt={lang.name}
                  style={{
                    width: 32,
                    height: 22,
                    borderRadius: 3,
                    objectFit: 'cover'
                  }}
                  />
                  <span style={{ fontSize: 11, color: 'white'}}>
                    {lang.name}
                  </span>
                  </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{
              display: 'flex', gap: 16, flexWrap: 'wrap',
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(20px)',
              transition: 'all 500ms ease 500ms',
            }}>
              <Link to="/library" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--navy)',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
                borderRadius: 12, padding: '0 28px', height: 52,
                textDecoration: 'none', border: '2px solid white',
                transition: 'all 200ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
              >Start Reading →</Link>

              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: 'white',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
                borderRadius: 12, padding: '0 28px', height: 52,
                textDecoration: 'none', border: '2px solid white',
                transition: 'all 200ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
              >Create Free Account</Link>
            </div>
          </div>

          {/* Right column — hero illustration */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: heroLoaded ? 1 : 0,
            transition: 'opacity 600ms ease 200ms',
          }}>
            <div style={{ animation: 'float 4s ease-in-out infinite', textAlign: 'center' }}>
              {/* Illustrated child reading — SVG */}
              <svg viewBox="0 0 320 320" width="340" height="340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* Glow circle */}
                <circle cx="160" cy="180" r="130" fill="rgba(255,255,255,0.07)" />
                <circle cx="160" cy="180" r="100" fill="rgba(255,255,255,0.06)" />

                {/* Floating stars */}
                <text x="60"  y="80"  fontSize="22" fill="var(--amber)" opacity="0.9">✦</text>
                <text x="240" y="100" fontSize="16" fill="white"         opacity="0.7">✦</text>
                <text x="50"  y="200" fontSize="14" fill="var(--amber)" opacity="0.6">★</text>
                <text x="260" y="240" fontSize="18" fill="white"         opacity="0.5">✦</text>
                <text x="150" y="50"  fontSize="12" fill="var(--amber)" opacity="0.8">✦</text>

                {/* Body */}
                <ellipse cx="160" cy="270" rx="70" ry="18" fill="rgba(0,0,0,0.15)" />

                {/* Legs (cross-legged) */}
                <ellipse cx="130" cy="248" rx="38" ry="18" fill="#8B5C3A" transform="rotate(-15 130 248)" />
                <ellipse cx="192" cy="248" rx="38" ry="18" fill="#7A4E31" transform="rotate(15 192 248)" />

                {/* Torso */}
                <rect x="128" y="165" width="64" height="72" rx="20" fill="#E8A020" />

                {/* Arms */}
                <rect x="100" y="175" width="38" height="22" rx="11" fill="#8B5C3A" transform="rotate(15 100 175)" />
                <rect x="184" y="175" width="38" height="22" rx="11" fill="#7A4E31" transform="rotate(-15 184 175)" />

                {/* Glowing book */}
                <rect x="112" y="200" width="96" height="68" rx="10" fill="white" opacity="0.95" />
                <rect x="112" y="200" width="96" height="68" rx="10" fill="none" stroke="var(--amber)" strokeWidth="2.5" />
                {/* Book glow */}
                <rect x="112" y="200" width="96" height="68" rx="10" fill="var(--amber)" opacity="0.12" />
                {/* Book pages */}
                <line x1="160" y1="200" x2="160" y2="268" stroke="#E0E0E0" strokeWidth="1.5" />
                {/* Text lines */}
                <rect x="120" y="215" width="32" height="4" rx="2" fill="#D0D0D0" />
                <rect x="120" y="225" width="28" height="4" rx="2" fill="#D0D0D0" />
                <rect x="120" y="235" width="32" height="4" rx="2" fill="#D0D0D0" />
                <rect x="120" y="245" width="24" height="4" rx="2" fill="#D0D0D0" />
                <rect x="168" y="215" width="32" height="4" rx="2" fill="#D0D0D0" />
                <rect x="168" y="225" width="28" height="4" rx="2" fill="#D0D0D0" />
                <rect x="168" y="235" width="32" height="4" rx="2" fill="#D0D0D0" />
                <rect x="168" y="245" width="24" height="4" rx="2" fill="#D0D0D0" />

                {/* Head */}
                <circle cx="160" cy="148" r="38" fill="#8B5C3A" />
                {/* Hair */}
                <ellipse cx="160" cy="118" rx="38" ry="18" fill="#3D2010" />
                <circle cx="135" cy="125" r="12" fill="#3D2010" />
                <circle cx="185" cy="125" r="12" fill="#3D2010" />
                {/* Hair puffs */}
                <circle cx="143" cy="112" r="10" fill="#3D2010" />
                <circle cx="160" cy="108" r="10" fill="#3D2010" />
                <circle cx="177" cy="112" r="10" fill="#3D2010" />

                {/* Face */}
                {/* Eyes — happy/reading */}
                <ellipse cx="149" cy="148" rx="6" ry="7" fill="#2D1A08" />
                <ellipse cx="171" cy="148" rx="6" ry="7" fill="#2D1A08" />
                {/* Eye shine */}
                <circle cx="151" cy="145" r="2" fill="white" />
                <circle cx="173" cy="145" r="2" fill="white" />
                {/* Smile */}
                <path d="M 148 162 Q 160 172 172 162" stroke="#2D1A08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Cheek blush */}
                <ellipse cx="140" cy="161" rx="8" ry="5" fill="rgba(255,120,80,0.3)" />
                <ellipse cx="180" cy="161" rx="8" ry="5" fill="rgba(255,120,80,0.3)" />

                {/* Floating letters around child */}
                <text x="72"  y="155" fontSize="20" fill="var(--amber)" opacity="0.8" transform="rotate(-15 72 155)">A</text>
                <text x="234" y="155" fontSize="20" fill="white"         opacity="0.7" transform="rotate(10 234 155)">b</text>
                <text x="88"  y="120" fontSize="16" fill="white"         opacity="0.6" transform="rotate(-8 88 120)">C</text>
                <text x="220" y="118" fontSize="16" fill="var(--amber)" opacity="0.7" transform="rotate(12 220 118)">d</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          color: 'var(--amber)', fontSize: 24,
          animation: 'bounceDown 1.2s ease-in-out infinite',
          zIndex: 2,
        }}>↓</div>

        {/* Hero → white curve transition */}
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0,
          height: 60, background: 'var(--amber)', /* Amber matches stat bar */
          clipPath: 'ellipse(55% 100% at 50% 100%)',
        }} />
      </section>

      {/* wHAT YOU CAN DO - ANIMATED CARDS */}
      <WhatYouCanDo />

      {/* ── SECTION 3: STATS BAR ───────────────────────────── */}
      <section style={{
        background: 'var(--amber)',
        padding: '0',
        minHeight: 80,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          flexWrap: 'wrap', gap: 16, padding: '20px 64px',
          width: '100%',
        }}>
          {[
            { value: '1,000+', label: 'Books' },
            { value: '5',      label: 'Languages' },
            { value: '✓',      label: 'Works Offline' },
            { value: '100%',   label: 'Free for Children' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div style={{ width: 1, height: 40, background: 'rgba(31,61,110,0.2)' }} className="hidden-mobile" />}
              <StatItem value={stat.value} label={stat.label} delay={`${i * 200}ms`} />
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── SECTION 8: CONTINUE READING (logged-in only) ───── */}
      {user && <ContinueReadingBanner user={user} books={books} />}

      {/* ── SECTION 4: FEATURED BOOKS CAROUSEL ─────────────── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 36, color: 'var(--navy)', marginBottom: 8, margin: '0 0 8px' }}>
              Featured Books
            </h2>
            <div style={{ width: 48, height: 4, background: 'var(--amber)', borderRadius: 99, margin: '10px auto 16px' }} />
            <p style={{ fontSize: 18, color: '#888', margin: 0, fontFamily: 'Nunito Sans' }}>
              Pick a book and start reading right now
            </p>
          </div>
          <BookCarousel books={books} />
        </div>
      </section>

      {/* ── SECTION 5: LANGUAGE SHOWCASE ────────────────────── */}
      <section style={{ background: 'white', padding: '100px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 36, color: 'var(--navy)', textAlign: 'center', marginBottom: 48, margin: '0 0 48px' }}>
            Read in your language
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
          }}>
            {[
              { flag: '🇬🇧', name: 'English',  example: 'Anansi the Spider',          bookCount: '42 books' },
              { flag: '🇰🇪', name: 'Swahili',  example: 'Simba na Ndoto Yake',        bookCount: '28 books' },
              { flag: '🇳🇬', name: 'Yoruba',   example: 'Adébáyọ̀ àti Àárọ̀ Tuntun', bookCount: '19 books' },
              { flag: '🇿🇦', name: 'Zulu',     example: 'UNomvula noMvula',           bookCount: '16 books' },
              { flag: '🇫🇷', name: 'French',   example: 'Kouamé et le Baobab',        bookCount: '33 books' },
            ].map((lang, i) => (
              <LanguageCard key={lang.name} {...lang} delay={`${i * 80}ms`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY ZEROUP READS ─────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 36, color: 'var(--navy)', textAlign: 'center', marginBottom: 56, margin: '0 0 56px' }}>
            Why children love ZeroUp Reads
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            <FeatureCard
              icon="📚" iconBg="var(--navy)"
              title="Stories in your language"
              body="Hundreds of books in English, Swahili, Yoruba, Zulu, French and more — with new languages added regularly."
              delay="0ms"
            />
            <FeatureCard
              icon="📵" iconBg="var(--green)"
              title="Read anywhere, anytime"
              body="ZeroUp Reads works without internet. Once you open a book, it's saved on your device forever."
              delay="100ms"
            />
            <FeatureCard
              icon="🛡️" iconBg="var(--amber)"
              title="Safe for children"
              body="No ads. No strangers. No data sold. Every book is reviewed for child safety by our team."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: HOW IT WORKS ──────────────────────────── */}
      <section style={{ background: 'white', padding: '100px 0' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 36, color: 'var(--navy)', textAlign: 'center', marginBottom: 64, margin: '0 0 64px' }}>
            How it works
          </h2>

          <div ref={howRef} style={{ position: 'relative', display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Connecting dashed line — desktop only */}
            <div className="hidden-mobile" style={{ position: 'absolute', top: 36, left: '10%', right: '10%', pointerEvents: 'none' }}>
              <svg width="100%" height="4">
                <line
                  x1="0%" y1="2" x2="100%" y2="2"
                  stroke="var(--navy)" strokeWidth="2" strokeDasharray="10 8"
                  strokeDashoffset={howVisible ? 0 : 400}
                  style={{ transition: 'stroke-dashoffset 1200ms ease 500ms' }}
                />
              </svg>
            </div>

            <HowStep number="1" numBg="var(--amber)"  emoji="📱" title="Create your free account"  caption="Sign up in 30 seconds. No card needed." delay="0ms"   />
            <HowStep number="2" numBg="var(--navy)"   emoji="📚" title="Browse the library"        caption="Thousands of books in 5 languages."    delay="200ms" />
            <HowStep number="3" numBg="var(--green)"  emoji="🎉" title="Read and grow"             caption="Track your progress and earn badges."   delay="400ms" />
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/register" className="btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--navy)', color: 'white',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
              borderRadius: 12, padding: '0 36px', height: 56,
              textDecoration: 'none', border: 'none',
              transition: 'all 200ms ease',
              animation: 'pulse 2.5s ease-in-out infinite',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.animation = 'none'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.animation = 'pulse 2.5s ease-in-out infinite'; }}
            >Get started free →</Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FOOTER ────────────────────────────────── */}
      <Footer />

      {/* Mobile responsive overrides */}
      <style>{`
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}
