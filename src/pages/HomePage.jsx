import { useState } from 'react';
import Footer from '../components/Footer';
import { useAuth } from '../modules/auth/AuthContext';
import * as booksService from '../modules/books/booksService';
import * as userService from '../services/userService';
import HeroSection from '../components/home/hero';
import HighlightsSection from '../components/home/highlights/HighlightsSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import CtaBlocksSection from '../components/home/CtaBlocksSection';
import ContinueReadingBanner from '../components/home/ContinueReadingBanner';
import DiscoverSection from '../components/home/discover/DiscoverSection';

export default function HomePage() {
  const { user } = useAuth();
  const [books] = useState(() => booksService.getBooks());

  // Real "in progress" books for this reader — mirrors ProfilePage's
  // progress-to-book merge pattern instead of the banner fabricating two
  // books as "in progress" for every logged-in user.
  const progress = userService.getProgress();
  const inProgressBooks = Object.entries(progress.inProgress || {})
    .map(([bookId, p]) => {
      const b = books.find((bk) => bk.id === bookId);
      return b ? { ...b, currentPage: p.currentPage, totalPages: p.totalPages } : null;
    })
    .filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ── HERO ─────────────────────────────────────────────
          Floating navbar + illustrated/photo slider + floating
          stats bar — see src/components/home/hero/HeroSection.tsx */}
      <HeroSection />

      {/* ── SEARCH BAR / EXPLORE LANGUAGES / READING LEVEL ──── */}
      <DiscoverSection />

      {/* ── CONTINUE READING (logged-in only, real progress only) ───── */}
      {user && inProgressBooks.length > 0 && <ContinueReadingBanner user={user} books={inProgressBooks} />}

      {/* ── HIGHLIGHTS (why we exist / popular books / languages map) ── */}
      <HighlightsSection books={books} />

      {/* ── HOW ZEROUP READS WORKS (5-step content pipeline) ── */}
      <HowItWorksSection />

      {/* ── TRANSLATE / READ / SUPPORT CTA STRIP ────────────── */}
      <CtaBlocksSection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
