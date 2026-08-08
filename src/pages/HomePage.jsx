import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../modules/auth/AuthContext';
import * as booksService from '../modules/books/booksService';
import useContinueReading from '../modules/reading/useContinueReading';
import HighlightsSection from '../components/home/highlights/HighlightsSection';
import PopularBooksSection from '../components/home/PopularBooksSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import CtaBlocksSection from '../components/home/CtaBlocksSection';
import ContinueReadingBanner from '../components/home/ContinueReadingBanner';
import DiscoverSection from '../components/home/discover/DiscoverSection';
import AiPoweredSection from '../components/home/aiPowered/AiPoweredSection';
import PreservingWordsSection from '../components/home/preservingWords/PreservingWordsSection';

export default function HomePage() {
  const { user } = useAuth();
  const [books] = useState(() => booksService.getBooks());
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Real "in progress" books for this reader — shared with the Library
  // page's "Continue Reading" section via useContinueReading, instead of
  // each place re-deriving this same merge.
  const inProgressBooks = useContinueReading(books);

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
      {/* ── HEADER + HERO — pixel-matched to the storybook design ──── */}
      <div className="hero2-viewport">
        <Navbar />

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
            {/* Legibility scrim — guarantees contrast for the text regardless of what's behind it in the illustration.
                Left-to-right fade matches the desktop's left-aligned text; mobile centers the text instead
                (see .hero2-text below), so .hero2-scrim gets its own top-to-bottom fade on mobile. */}
            <div aria-hidden="true" className="hero2-scrim" style={{
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
                  {i > 0 && <div className="hidden-mobile hero2-stat-divider" style={{ width: 1, height: 36, background: '#EEE7DA' }} />}
                  <div className="hero2-stat-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="hero2-stat-icon" style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">{stat.icon}</span>
                    <div>
                      <div className="hero2-stat-value" style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--hero-ink)' }}>{stat.value}</div>
                      <div className="hero2-stat-label" style={{ fontFamily: 'Nunito Sans', fontSize: 13, color: 'var(--hero-gray)' }}>{stat.label}</div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── SEARCH BAR / EXPLORE LANGUAGES / READING LEVEL ──── */}
      <DiscoverSection />

      {/* ── CONTINUE READING (logged-in only, real progress only) ───── */}
      {user && inProgressBooks.length > 0 && <ContinueReadingBanner user={user} books={inProgressBooks} />}

      {/* ── HIGHLIGHTS (why we exist / languages map) ── */}
      <HighlightsSection />

      {/* ── POPULAR BOOKS (sorted by reads, horizontal scroll) ── */}
      <PopularBooksSection books={books} />

      {/* ── HOW ZEROUP READS WORKS (5-step content pipeline) ── */}
      <HowItWorksSection />

      {/* ── TRANSLATE / READ / SUPPORT CTA STRIP ────────────── */}
      <CtaBlocksSection />

      {/* ── AI-POWERED. HUMAN-GUIDED. ───────────────────────── */}
      <AiPoweredSection />

      {/* ── PRESERVING MORE THAN WORDS ──────────────────────── */}
      <PreservingWordsSection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
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
          /* Taller (less cinematic) crop than desktop's 21/9 so the slide
             illustration and headline stay legible instead of being
             squeezed into a thin strip. */
          .hero2-stage { aspect-ratio: 4 / 3 !important; }
          /* Centered mobile text needs a scrim that's strong in the middle
             band (behind the text) and fades top/bottom, instead of the
             desktop left-to-right fade that leaves centered text exposed
             over busy illustration detail. */
          .hero2-scrim {
            background: linear-gradient(
              180deg,
              rgba(255,251,240,0.35) 0%,
              rgba(255,251,240,0.9) 22%,
              rgba(255,251,240,0.9) 68%,
              rgba(255,251,240,0.35) 100%
            ) !important;
          }
          .hero2-row { padding: 32px 24px; }
          .hero2-text { max-width: 100% !important; text-align: center; }
          .hero2-text > div { justify-content: center; }
          .hero2-arrow { width: 36px; height: 36px; font-size: 16px; }
          .hero2-dots { bottom: 60px; }

          /* Stat bar: one compact, horizontally-scrollable line instead of
             wrapping to several rows and pushing the slider down. */
          .hero2-statbar {
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding: 12px 16px !important;
            gap: 14px !important;
            margin-top: -10px !important;
            -webkit-overflow-scrolling: touch;
          }
          .hero2-statbar-wrap { -ms-overflow-style: none; scrollbar-width: none; }
          .hero2-statbar::-webkit-scrollbar { display: none; }
          .hero2-stat-item { gap: 6px !important; flex-shrink: 0; }
          .hero2-stat-icon { font-size: 18px !important; }
          .hero2-stat-value { font-size: 13px !important; white-space: nowrap; }
          .hero2-stat-label { font-size: 10px !important; white-space: nowrap; }
        }
      `}</style>


    </div>
  );
}
