import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../modules/auth/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import * as booksService from '../modules/books/booksService';
import StatItem from '../components/home/StatItem';
import BookCarousel from '../components/home/BookCarousel';
import LanguageCard from '../components/home/LanguageCard';
import FeatureCard from '../components/home/FeatureCard';
import HowStep from '../components/home/HowStep';
import ContinueReadingBanner from '../components/home/ContinueReadingBanner';
import WhatYouCanDo from '../components/home/WhatYouCanDo';

export default function HomePage() {
  const { user } = useAuth();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [howRef, howVisible] = useScrollReveal(0.1);
  const [books] = useState(() => booksService.getBooks());
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const heroSlides = [
    {
      image: '/images/hero-slide-1.png',
      headline: <>Every Child Deserves a Story in Their Own Language.</>,
      subtext: 'Discover beautiful books written in African languages and made for every young reader.',
      buttons: [
        { label: '📖 Start Reading', to: '/library', variant: 'primary' },
        { label: '🔍 Explore Library', to: '/library', variant: 'secondary' },
      ],
    },
    {
      image: '/images/hero-slide-2.png',
      headline: <>What will you <span style={{ color: 'var(--hero-orange)' }}>invent</span> tomorrow, in your own language?</>,
      subtext: 'Explore amazing stories about technology, AI, robots and the future we can build together.',
      buttons: [
        { label: 'Discover AI & Tech Stories →', to: '/library', variant: 'primary' },
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(s => (s + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const heroStats = [
    { icon: '💬', value: '500+',       label: 'Languages' },
    { icon: '📚', value: 'Thousands',  label: 'of Stories' },
    { icon: '🌍', value: 'Across',     label: 'Africa' },
    { icon: '🤖', value: 'AI',         label: 'Powered' },
    { icon: '🎁', value: 'Free',       label: "Children's Books" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="hero2-viewport">
      {/* Navbar */}
      <Navbar />

      {/* ── SECTION 2: HERO ────────────────────────────────── */}
      <section className="hero2-section" style={{ background: 'var(--hero-cream)', padding: 0 }}>
        <div className="hero2-stage" style={{
          position: 'relative',
          aspectRatio: '21 / 9',
          backgroundColor: 'var(--hero-cream)',
          overflow: 'hidden',
        }}>
          {/* Slide backgrounds — crossfade between slides */}
          {heroSlides.map((slide, i) => (
            <div key={slide.image} aria-hidden={i !== activeSlide} style={{
              position: 'absolute', inset: 0, zIndex: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left 55%',
              backgroundRepeat: 'no-repeat',
              opacity: i === activeSlide ? 1 : 0,
              transition: 'opacity 800ms ease',
            }} />
          ))}
          {/* Legibility scrim — guarantees contrast for the text regardless of what's behind it in the illustration */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: 'linear-gradient(100deg, rgba(255,251,240,0.92) 0%, rgba(255,251,240,0.82) 28%, rgba(255,251,240,0.35) 48%, rgba(255,251,240,0) 62%)',
          }} />
          <div className="container hero2-row" style={{
            position: 'relative', zIndex: 2,
            display: 'flex', alignItems: 'flex-start',
            height: '100%',
            paddingTop: 'clamp(28px, 9vh, 88px)',
          }}>
            <div key={activeSlide} className="hero2-text" style={{
              maxWidth: 480,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(16px)',
              transition: 'all 500ms ease',
              animation: 'fadeIn 400ms ease',
            }}>
              <h1 style={{
                fontFamily: 'Nunito', fontWeight: 900, color: 'var(--hero-ink)',
                fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 1.22, margin: '0 0 18px',
              }}>
                {heroSlides[activeSlide].headline}
              </h1>
              <p style={{
                fontFamily: 'Nunito Sans', fontSize: 17, color: 'var(--hero-gray)',
                lineHeight: 1.6, margin: '0 0 28px', maxWidth: 420,
              }}>
                {heroSlides[activeSlide].subtext}
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {heroSlides[activeSlide].buttons.map(btn => (
                  <Link key={btn.label} to={btn.to} style={btn.variant === 'primary' ? {
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--hero-green)', color: 'white',
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
                    borderRadius: 999, padding: '0 26px', height: 48,
                    textDecoration: 'none', border: '2px solid var(--hero-green)',
                    transition: 'transform 200ms ease',
                  } : {
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'white', color: 'var(--hero-orange)',
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 16,
                    borderRadius: 999, padding: '0 24px', height: 48,
                    textDecoration: 'none', border: '2px solid var(--hero-orange)',
                    transition: 'transform 200ms ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >{btn.label}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Slider arrows */}
          <button
            aria-label="Previous slide"
            onClick={() => setActiveSlide(s => (s + heroSlides.length - 1) % heroSlides.length)}
            className="hero2-arrow hero2-arrow-left"
          >‹</button>
          <button
            aria-label="Next slide"
            onClick={() => setActiveSlide(s => (s + 1) % heroSlides.length)}
            className="hero2-arrow hero2-arrow-right"
          >›</button>

          {/* Slide dots */}
          <div className="hero2-dots">
            {heroSlides.map((slide, i) => (
              <span
                key={slide.image}
                className={i === activeSlide ? 'active' : ''}
                onClick={() => setActiveSlide(i)}
              />
            ))}
          </div>
        </div>

        {/* Floating stat bar — overlaps the hero's bottom edge */}
        <div className="container hero2-statbar-wrap" style={{ position: 'relative' }}>
          <div className="hero2-statbar" style={{
            background: 'white', borderRadius: 24,
            boxShadow: '0 16px 48px rgba(58,26,16,0.15)',
            margin: '-16px auto 0', position: 'relative', zIndex: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            padding: '22px 32px', flexWrap: 'wrap', gap: 16, maxWidth: 1080,
            opacity: heroLoaded ? 1 : 0,
            transition: 'opacity 500ms ease 200ms',
          }}>
            {heroStats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="hidden-mobile" style={{ width: 1, height: 36, background: '#EEE7DA' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">{stat.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--hero-ink)' }}>{stat.value}</div>
                    <div style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>{stat.label}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* wHAT YOU CAN DO - ANIMATED CARDS */}
      <WhatYouCanDo />

      {/* ── SECTION 2B: MISSION STATEMENT ───────────────────── */}
      <section style={{ background: 'var(--navy)', padding: '100px 0' }}>
        <div className="container">
          <div className="preview-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64, alignItems: 'center',
          }}>
            {/* Left — dashboard image */}
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <img
                src="/images/dashboard-preview.png"
                alt="ZeroUp Reads dashboard — Continue Your Journey and Explore by Category"
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>

            {/* Right — mission statement */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--amber)', color: 'var(--navy)',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
                borderRadius: 99, padding: '5px 14px', marginBottom: 24,
              }}>🌍 Our Mission</div>

              <h2 style={{
                fontFamily: 'Nunito', fontWeight: 900, color: 'white',
                fontSize: 'clamp(26px, 3.4vw, 38px)', lineHeight: 1.25,
                margin: '0 0 20px',
              }}>
                Every child deserves to read in a language that feels like{' '}
                <span style={{ color: 'var(--amber)' }}>home</span>.
              </h2>

              <p style={{
                color: 'rgba(255,255,255,0.85)', fontSize: 18, lineHeight: 1.7,
                fontFamily: 'Nunito Sans', margin: 0,
              }}>
                Across Sub-Saharan Africa, 225 million adults can't read — and millions of children are taught to read in a language they don't speak at home. Nigeria alone has over 500 indigenous languages, yet almost none are represented in the books children grow up with. ZeroUp Reads exists to close that gap, one story at a time — so no child is denied knowledge because of the language they were born speaking.
              </p>
            </div>
          </div>
        </div>
      </section>

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

      {/* Hero slider chrome + responsive overrides */}
      <style>{`
        .hero2-row { padding-left: clamp(76px, 9%, 130px); padding-right: 24px; }
        .hero2-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.92); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: var(--hero-ink);
          box-shadow: 0 6px 20px rgba(58,26,16,0.18);
          z-index: 4; transition: transform 200ms ease;
        }
        .hero2-arrow:hover { transform: translateY(-50%) scale(1.08); }
        .hero2-arrow-left { left: clamp(16px, 4%, 48px); }
        .hero2-arrow-right { right: clamp(16px, 4%, 48px); }
        .hero2-dots {
          position: absolute; bottom: 56px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 4;
        }
        .hero2-dots span {
          width: 9px; height: 9px; border-radius: 50%;
          background: rgba(255,255,255,0.6); cursor: pointer;
          transition: all 200ms ease;
        }
        .hero2-dots span.active { background: white; transform: scale(1.2); }

        /* Laptop+: fit header + hero + stat bar entirely within the viewport, no scroll */
        @media (min-width: 1024px) {
          .hero2-viewport { height: 100vh; display: flex; flex-direction: column; }
          .hero2-section { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
          .hero2-stage {
            flex: 1 1 auto !important; min-height: 0 !important;
            aspect-ratio: unset !important;
          }
          .hero2-statbar-wrap { flex: 0 0 auto; }
        }

        @media (max-width: 767px) {
          .hero2-row { padding: 32px 24px; }
          .hero2-text { max-width: 100% !important; text-align: center; }
          .hero2-text > div { justify-content: center; }
          .hero2-arrow { width: 36px; height: 36px; font-size: 16px; }
          .hero2-dots { bottom: 60px; }
          .hero2-statbar { justify-content: center !important; padding: 18px !important; }
          .preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
