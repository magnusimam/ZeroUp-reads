import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { MOCK_BOOKS } from '../utils/mockData';

/* ── FLOATING BACKGROUND SHAPES ─────────────────────────── */
function FloatingShapes() {
  const shapes = [
    { size: 120, top: '10%',  left: '5%',  delay: '0s',   duration: '7s'  },
    { size: 60,  top: '25%',  left: '80%', delay: '1s',   duration: '9s'  },
    { size: 90,  top: '60%',  left: '12%', delay: '2s',   duration: '6s'  },
    { size: 40,  top: '70%',  left: '70%', delay: '0.5s', duration: '8s'  },
    { size: 70,  top: '15%',  left: '55%', delay: '3s',   duration: '10s' },
    { size: 50,  top: '80%',  left: '40%', delay: '1.5s', duration: '7s'  },
    { size: 30,  top: '45%',  left: '90%', delay: '2.5s', duration: '9s'  },
    { size: 80,  top: '35%',  left: '25%', delay: '4s',   duration: '8s'  },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          animation: `floatSlow ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}
      {/* Star sparkles */}
      {['20%','45%','75%','88%','33%'].map((left, i) => (
        <div key={`star-${i}`} style={{
          position: 'absolute', left, top: `${15 + i * 14}%`,
          fontSize: 16, opacity: 0.12,
          animation: `float ${6 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
        }}>✦</div>
      ))}
    </div>
  );
}

/* ── STAT BAR COUNT-UP ───────────────────────────────────── */
function StatItem({ value, label, delay }) {
  const [ref, visible] = useScrollReveal();
  const [count, setCount] = useState(0);
  const numeric = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const steps = 60;
    const increment = numeric / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, numeric]);

  return (
    <div ref={ref} style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
      <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 28, color: 'var(--navy)' }}>
        {visible ? `${count}${suffix}` : value}
      </div>
      <div style={{ fontSize: 14, color: 'white', marginTop: 2, fontFamily: 'Nunito Sans' }}>{label}</div>
    </div>
  );
}

/* ── BOOK CAROUSEL ───────────────────────────────────────── */
function BookCarousel({ books }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const total = books.length;

  // Determine visible count based on window width
  const [visibleCount, setVisibleCount] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setVisibleCount(1.2);
      else if (window.innerWidth < 1280) setVisibleCount(2);
      else setVisibleCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Auto-advance every 4s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 4000);
    return () => clearInterval(t);
  }, [isHovered, total]);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const handleTouchStart = e => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = e => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cards track */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{
          display: 'flex', gap: 24,
          transform: `translateX(calc(-${current * (100 / Math.floor(visibleCount))}% - ${current * 24 / Math.floor(visibleCount)}px))`,
          transition: 'transform 350ms ease-out',
        }}>
          {books.map((book, i) => (
            <div key={book.id} style={{
              flexShrink: 0,
              width: `calc(${100 / Math.floor(visibleCount)}% - ${(Math.floor(visibleCount) - 1) * 24 / Math.floor(visibleCount)}px)`,
            }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 32 }}>
        <button onClick={prev} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--navy)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--amber)', fontSize: 18,
          transition: 'transform 200ms ease, background 200ms ease',
          boxShadow: '0 4px 16px rgba(31,61,110,0.2)',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Previous"
        >←</button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {books.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 10, height: 10,
              borderRadius: 99,
              background: i === current ? 'var(--navy)' : '#DDDDDD',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 300ms ease',
            }} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>

        <button onClick={next} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--navy)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--amber)', fontSize: 18,
          transition: 'transform 200ms ease, background 200ms ease',
          boxShadow: '0 4px 16px rgba(31,61,110,0.2)',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Next"
        >→</button>
      </div>
    </div>
  );
}

/* ── LANGUAGE CARD ───────────────────────────────────────── */
function LanguageCard({ flag, name, example, bookCount, delay }) {
  const [ref, visible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={{
      background: 'var(--cream)',
      borderRadius: 16,
      padding: '28px 20px',
      textAlign: 'center',
      border: hovered ? '2px solid var(--navy)' : '2px solid transparent',
      transform: hovered ? 'scale(1.04)' : visible ? 'scale(1)' : 'scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: `all 300ms ease ${delay}`,
      cursor: 'pointer',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 48, marginBottom: 10 }}>{flag}</div>
      <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 22, color: 'var(--navy)', marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 16, color: 'var(--charcoal)', marginBottom: 8, fontFamily: 'Nunito Sans' }}>{example}</div>
      <div style={{ fontSize: 14, color: 'var(--amber)', fontWeight: 700, fontFamily: 'Nunito' }}>{bookCount}</div>
    </div>
  );
}

/* ── FEATURE CARD ────────────────────────────────────────── */
function FeatureCard({ icon, iconBg, title, body, delay }) {
  const [ref, visible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={{
      background: 'white',
      borderRadius: 16,
      padding: '32px',
      boxShadow: '0 8px 32px rgba(31,61,110,0.08)',
      transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(30px)',
      opacity: visible ? 1 : 0,
      transition: `all 400ms ease ${delay}`,
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 600ms ease',
        boxShadow: `0 8px 24px ${iconBg}44`,
      }}>{icon}</div>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--navy)', marginBottom: 12, margin: '0 0 12px' }}>{title}</h3>
      <p style={{ fontSize: 16, color: '#555', lineHeight: 1.7, margin: 0, fontFamily: 'Nunito Sans' }}>{body}</p>
    </div>
  );
}

/* ── HOW-IT-WORKS STEP ───────────────────────────────────── */
function HowStep({ number, numBg, emoji, title, caption, delay }) {
  const [ref, visible] = useScrollReveal(0.2);
  return (
    <div ref={ref} style={{
      textAlign: 'center', flex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 500ms ease ${delay}`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: numBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, color: 'white',
        margin: '0 auto 20px',
        boxShadow: `0 8px 24px ${numBg}55`,
      }}>{number}</div>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 20, color: 'var(--navy)', marginBottom: 8, margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 18, color: 'var(--charcoal)', margin: 0, fontFamily: 'Nunito Sans' }}>{caption}</p>
    </div>
  );
}

/* ── CONNECTING LINE ANIMATION ───────────────────────────── */
function ConnectingLine({ visible }) {
  return (
    <svg width="100%" height="4" style={{ position: 'absolute', top: 36, left: 0, right: 0, overflow: 'visible' }}>
      <line
        x1="16%" y1="2" x2="84%" y2="2"
        stroke="var(--navy)" strokeWidth="2" strokeDasharray="8 6"
        strokeDashoffset={visible ? 0 : 300}
        style={{ transition: 'stroke-dashoffset 1200ms ease 400ms' }}
      />
    </svg>
  );
}

/* ── CONTINUE READING BANNER ─────────────────────────────── */
function ContinueReadingBanner({ user }) {
  const navigate = useNavigate();
  const inProgress = [
    { ...MOCK_BOOKS[0], currentPage: 5, totalPages: 12 },
    { ...MOCK_BOOKS[1], currentPage: 3, totalPages: 10 },
  ];

  return (
    <section style={{
      background: 'linear-gradient(135deg, #E8A020 0%, #F5A623 100%)',
      padding: '32px 0',
      animation: 'slideDown 400ms ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--navy)', margin: '0 0 4px' }}>
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p style={{ margin: 0, color: 'var(--navy)', fontSize: 16, opacity: 0.8, fontFamily: 'Nunito Sans' }}>Ready to keep reading?</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {inProgress.map(book => (
            <button key={book.id} onClick={() => navigate(`/read/${book.id}`)} style={{
              background: 'rgba(31,61,110,0.12)', border: '2px solid rgba(31,61,110,0.2)',
              borderRadius: 12, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              transition: 'all 200ms ease',
              minHeight: 64,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(31,61,110,0.22)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,61,110,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ fontSize: 28 }}>📖</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: 'var(--navy)', maxWidth: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
                <div style={{ fontFamily: 'Nunito Sans', fontSize: 12, color: 'rgba(31,61,110,0.7)' }}>Page {book.currentPage} of {book.totalPages}</div>
              </div>
            </button>
          ))}
        </div>
        <Link to="/library" style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--navy)',
          textDecoration: 'none', borderBottom: '2px solid var(--navy)', paddingBottom: 2,
          whiteSpace: 'nowrap',
        }}>See all your books →</Link>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [howRef, howVisible] = useScrollReveal(0.1);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* ── HERO SECTION ──────────────────────────────────────── */
  const languages = [
    { flag: '🇬🇧', name: 'English' },
    { flag: '🇰🇪', name: 'Swahili' },
    { flag: '🇳🇬', name: 'Yoruba'  },
    { flag: '🇿🇦', name: 'Zulu'    },
    { flag: '🇫🇷', name: 'French'  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Navbar — transparent over hero */}
      <Navbar transparent />

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
                  textAlign: 'center',
                  opacity: heroLoaded ? 1 : 0,
                  transition: `opacity 300ms ease ${300 + i * 100}ms`,
                }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{lang.flag}</div>
                  <div style={{ color: 'white', fontSize: 12, marginTop: 4, fontFamily: 'Nunito Sans', fontWeight: 600 }}>{lang.name}</div>
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
      {user && <ContinueReadingBanner user={user} />}

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
          <BookCarousel books={MOCK_BOOKS} />
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
