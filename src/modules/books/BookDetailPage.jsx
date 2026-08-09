import React, { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Headphones, Globe, Download, Heart, Star, Clock, Users2, PenLine,
  ArrowLeft, ChevronLeft, ChevronRight, Crown, Lightbulb, ScrollText, ShieldCheck,
  Users, HeartHandshake, Check, Sparkles,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookCoverArt from './BookCoverArt';
import BookCard from './BookCard';
import DownloadButton from '../reading/components/DownloadButton';
import useBookDetail from './useBookDetail';
import useTranslateRequest from '../library/useTranslateRequest';
import TranslateRequestModal from '../library/components/TranslateRequestModal';
import { useToast } from '../../context/ToastContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { LANGUAGE_FLAG } from './languageFlags';

// Fixed 3-value enum (BOOK_LEVELS in mockData.js) — a "Level N" label for a
// closed set of levels, not a business rule that needs to live in rules.js.
const LEVEL_LABEL = { Beginner: 'Level 1', Intermediate: 'Level 2', Advanced: 'Level 3' };

// Cycled across a book's learning objectives (icon + colour per card) — a
// fixed 5-step presentation palette, not a business rule.
const LEARNING_CARD_STYLES = [
  { icon: Crown, bg: 'bg-story-yellow', ring: 'ring-story-orange/20', color: 'text-story-orange' },
  { icon: ScrollText, bg: 'bg-story-mint', ring: 'ring-green/25', color: 'text-green' },
  { icon: ShieldCheck, bg: 'bg-story-lavender', ring: 'ring-[#8B6BE0]/25', color: 'text-[#8B6BE0]' },
  { icon: Users, bg: 'bg-story-sky', ring: 'ring-sky-blue/25', color: 'text-sky-blue' },
  { icon: HeartHandshake, bg: 'bg-story-pink', ring: 'ring-coral/25', color: 'text-coral' },
];

// Decorative "listen with AI" illustration for the bottom banner — hand-rolled
// inline SVG (matches BookCoverArt/Navbar's approach elsewhere) rather than a
// hosted image asset, so the page stays self-contained.
function ListenBannerKid() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="60" cy="60" r="58" fill="#0B1F4D" opacity="0.06" />
      <circle cx="60" cy="52" r="22" fill="#F5C89A" />
      <path d="M40 46 C40 30 80 30 80 46 L80 40 C80 26 40 26 40 40 Z" fill="#3A2415" />
      <path d="M38 50 C34 50 32 66 40 68 L42 56 Z" fill="#0B1F4D" />
      <path d="M82 50 C86 50 88 66 80 68 L78 56 Z" fill="#0B1F4D" />
      <rect x="30" y="44" width="10" height="18" rx="5" fill="#0B1F4D" />
      <rect x="80" y="44" width="10" height="18" rx="5" fill="#0B1F4D" />
      <path d="M35 46 C35 20 85 20 85 46" fill="none" stroke="#0B1F4D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="52" cy="53" r="2.4" fill="#3A2415" />
      <circle cx="68" cy="53" r="2.4" fill="#3A2415" />
      <path d="M52 62 Q60 67 68 62" fill="none" stroke="#3A2415" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 100 C30 82 44 74 60 74 C76 74 90 82 90 100 Z" fill="#FF8A1E" />
      <rect x="46" y="86" width="28" height="20" rx="4" fill="#FFF9F2" transform="rotate(-6 60 96)" />
    </svg>
  );
}

function StarRating({ rating, size = 18 }) {
  const pct = Math.max(0, Math.min(1, (rating || 0) / 5)) * 100;
  return (
    <span className="relative inline-flex" style={{ lineHeight: 0 }}>
      <span className="flex gap-0.5 text-story-navy/15">
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} fill="currentColor" stroke="none" />)}
      </span>
      <span className="absolute inset-0 overflow-hidden flex gap-0.5" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} fill="currentColor" stroke="none" className="text-story-orange shrink-0" />)}
      </span>
    </span>
  );
}

// Label text always stays dark navy for contrast against the light pastel
// pill backgrounds (colouring the label to match, e.g. orange-on-yellow,
// fails ~2.5:1 contrast) — only the icon carries the accent colour.
function InfoPill({ icon: Icon, label, bg, iconColor }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} text-ink-primary text-xs sm:text-sm font-nunito font-bold rounded-badge px-3.5 py-1.5`}>
      <Icon size={14} className={iconColor} /> {label}
    </span>
  );
}

// Reusable for every book in the library: every piece of copy below is read
// from `book`/the useBookDetail hook, nothing here is specific to one title.
export default function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const translateRequest = useTranslateRequest();
  const relatedScrollRef = useRef(null);
  const [relatedPage, setRelatedPage] = useState(0);

  const {
    book, favourited, toggleFavourite, downloadBook,
    estimatedMinutes, availableLanguages, moreLanguagesCount, learningObjectives, relatedBooks, tagline,
  } = useBookDetail(bookId);

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-story-cream">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-5xl mb-4">📖</p>
            <h1 className="text-xl font-bold text-story-navy font-nunito">Book not found</h1>
            <Link to="/library" className="text-story-orange font-nunito font-bold text-sm mt-3 inline-block">
              ← Back to Library
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  function handleListenWithAI() {
    if (isFeatureEnabled('bookAIReading')) return;
    toast?.addToast('✨ Listen with AI is coming soon for this book!', 'info');
  }

  function handleDownload() {
    downloadBook();
    toast?.addToast(`Downloaded "${book.title}" for offline reading 📥`, 'success');
  }

  function handleSave() {
    toggleFavourite();
    toast?.addToast(favourited ? `Removed "${book.title}" from Saved` : `Saved "${book.title}" 💛`, 'success');
  }

  function scrollRelated(direction) {
    const el = relatedScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  function handleRelatedScroll() {
    const el = relatedScrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const dots = Math.max(1, relatedBooks.length);
    setRelatedPage(Math.min(dots - 1, Math.round((el.scrollLeft / maxScroll) * (dots - 1))));
  }

  const actionButtons = [
    { key: 'read', label: 'Read Now', icon: BookOpen, onClick: () => navigate(`/read/${book.id}`), className: 'bg-story-orange text-white shadow-[0_10px_28px_rgba(255,138,30,0.35)] hover:bg-story-orange-dark' },
    { key: 'ai', label: 'Listen with AI', icon: Headphones, onClick: handleListenWithAI, className: 'bg-story-lavender text-story-navy hover:brightness-95' },
    { key: 'translate', label: 'Translate', icon: Globe, onClick: () => translateRequest.open(book), className: 'bg-story-mint text-story-navy hover:brightness-95' },
    { key: 'download', label: 'Download', icon: Download, onClick: handleDownload, className: 'bg-story-yellow text-story-navy hover:brightness-95' },
    { key: 'save', label: 'Save', icon: Heart, onClick: handleSave, className: `bg-white border-2 border-story-navy/10 text-story-navy hover:border-story-orange/40 ${favourited ? 'text-coral' : ''}`, filled: favourited },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
      <Navbar />

      <div className="container pt-6">
        <button
          onClick={() => navigate('/library')}
          className="inline-flex items-center gap-1.5 text-sm font-nunito font-bold text-ink-primary hover:text-story-orange transition-colors"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      {/* HERO — cover + info, light storybook theme */}
      <div className="container pt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14 items-start">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto lg:mx-0 w-full max-w-[320px]"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-story-float aspect-[3/4] transition-transform duration-300 hover:-translate-y-1">
              <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <span className="font-playfair text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
                  {book.title}
                </span>
              </div>
              {tagline && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pt-10 pb-4">
                  <p className="text-white/90 text-xs font-nunito font-bold text-center leading-snug">{tagline}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-story-yellow text-story-orange">
              <Crown size={18} fill="currentColor" />
            </span>

            <h1 className="font-nunito text-3xl md:text-5xl font-extrabold leading-tight text-story-navy">
              {book.title}
            </h1>
            <p className="text-story-navy/70 font-nunito font-bold">By {book.author}</p>

            <div className="flex items-center gap-2.5">
              <StarRating rating={book.rating} />
              <span className="text-ink-primary font-nunito font-bold text-sm">
                {book.rating?.toFixed(1)} <span className="text-ink-secondary font-semibold">({book.reads?.toLocaleString()} readers)</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              <InfoPill icon={BookOpen} label={book.category} bg="bg-story-lavender" iconColor="text-[#8B6BE0]" />
              <InfoPill icon={PenLine} label={LEVEL_LABEL[book.level] || book.level} bg="bg-story-mint" iconColor="text-green" />
              {book.ageGroup && <InfoPill icon={Users2} label={`Ages ${book.ageGroup === 'Children' ? '8-12' : book.ageGroup}`} bg="bg-story-yellow" iconColor="text-story-orange" />}
              <InfoPill icon={Clock} label={`${estimatedMinutes} min read`} bg="bg-story-sky" iconColor="text-sky-blue" />
            </div>

            {book.description && (
              <p className="text-ink-secondary leading-relaxed max-w-2xl mt-1">{book.description}</p>
            )}

            {/* Large rounded pill action buttons */}
            <div className="flex flex-wrap gap-3 mt-3">
              {actionButtons.map(({ key, label, icon: Icon, onClick, className, filled }) => (
                <button
                  key={key}
                  onClick={onClick}
                  className={`inline-flex items-center justify-center gap-2 rounded-full min-h-[52px] px-6 font-nunito font-bold text-[15px] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${className}`}
                >
                  <Icon size={18} fill={filled ? 'currentColor' : 'none'} />
                  {label}
                </button>
              ))}
              <DownloadButton book={book} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Story Preview + Available Languages */}
      <div className="container pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {book.content?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 bg-white rounded-3xl shadow-story-card p-6 md:p-7"
            >
              <h2 className="inline-flex items-center gap-2 font-nunito text-lg font-extrabold text-story-navy mb-4">
                <BookOpen size={20} className="text-story-orange" /> Story Preview
              </h2>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative w-full sm:w-40 h-40 shrink-0 rounded-2xl overflow-hidden shadow-story-card">
                  <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div className="flex-1">
                  <p className="text-ink-secondary leading-relaxed">{book.content[0]}</p>
                  <button
                    onClick={() => navigate(`/read/${book.id}`)}
                    className="mt-3 inline-flex items-center gap-1 text-story-orange font-nunito font-bold text-sm hover:text-story-navy transition-colors"
                  >
                    Read more <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {availableLanguages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="lg:col-span-2 bg-white rounded-3xl shadow-story-card p-6 md:p-7"
            >
              <h2 className="inline-flex items-center gap-2 font-nunito text-lg font-extrabold text-story-navy mb-4">
                <Globe size={20} className="text-sky-blue" /> Available Languages
              </h2>
              <div className="flex flex-col gap-2.5">
                {availableLanguages.map((lang) => {
                  const selected = lang === book.language;
                  return (
                    <div
                      key={lang}
                      className={`flex items-center justify-between rounded-2xl px-4 py-2.5 border-2 transition-colors ${
                        selected ? 'border-story-orange/40 bg-story-yellow/40' : 'border-story-navy/8 bg-story-cream/60'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5 font-nunito font-bold text-ink-primary text-sm">
                        <span className="text-lg leading-none">{LANGUAGE_FLAG[lang] || '🌍'}</span> {lang}
                      </span>
                      {selected && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-story-orange text-white">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {moreLanguagesCount > 0 && (
                <button
                  onClick={() => translateRequest.open(book)}
                  className="mt-4 inline-flex items-center gap-1 text-story-orange font-nunito font-bold text-sm hover:text-story-navy transition-colors"
                >
                  + {moreLanguagesCount} more languages <ChevronRight size={15} />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* What You'll Learn */}
      {learningObjectives.length > 0 && (
        <div className="container pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="inline-flex items-center gap-2 font-nunito text-lg font-extrabold text-story-navy mb-5">
              <Lightbulb size={20} className="text-story-orange" /> What You'll Learn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {learningObjectives.map((objective, i) => {
                const { icon: Icon, bg, ring, color } = LEARNING_CARD_STYLES[i % LEARNING_CARD_STYLES.length];
                const title = typeof objective === 'string' ? null : objective.title;
                const description = typeof objective === 'string' ? objective : objective.description;
                return (
                  <div key={i} className={`rounded-3xl p-5 bg-white ring-1 ring-story-navy/5 shadow-story-card flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1`}>
                    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full ${bg} ring-1 ${ring} ${color}`}>
                      <Icon size={20} />
                    </span>
                    {title && <p className="font-nunito font-extrabold text-ink-primary text-sm">{title}</p>}
                    <p className="text-ink-secondary text-sm leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Related books carousel */}
      {relatedBooks.length > 0 && (
        <div className="container pb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="inline-flex items-center gap-2 font-nunito text-lg font-extrabold text-story-navy">
              <Star size={20} className="text-story-orange" fill="currentColor" /> You May Also Like
            </h2>
            <div className="flex items-center gap-3">
              <Link to="/library" className="text-story-orange font-nunito font-bold text-sm hover:text-story-navy transition-colors">
                View all
              </Link>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => scrollRelated(-1)}
                  aria-label="Scroll related books left"
                  className="w-9 h-9 rounded-full border-2 border-story-navy/15 flex items-center justify-center text-story-navy hover:bg-story-navy hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollRelated(1)}
                  aria-label="Scroll related books right"
                  className="w-9 h-9 rounded-full border-2 border-story-navy/15 flex items-center justify-center text-story-navy hover:bg-story-navy hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={relatedScrollRef}
            onScroll={handleRelatedScroll}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
          >
            {relatedBooks.map((related) => (
              <div key={related.id} className="flex-none w-[190px] sm:w-[220px] snap-start">
                <BookCard book={related} compact />
              </div>
            ))}
          </div>
          {relatedBooks.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {relatedBooks.map((related, i) => (
                <span
                  key={related.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === relatedPage ? 'w-5 bg-story-orange' : 'w-1.5 bg-story-navy/15'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom promo banner — AI narration */}
      <div className="container pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-story-yellow to-story-yellow/60 shadow-story-card px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row items-center gap-6"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-story-navy text-white shrink-0">
            <Headphones size={26} />
          </span>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-nunito text-lg md:text-xl font-extrabold text-story-navy flex items-center justify-center md:justify-start gap-2">
              New here? Listen to this book with AI voice <Sparkles size={18} className="text-story-orange" />
            </h3>
            <p className="text-ink-secondary text-sm mt-1">Let our AI reader bring the story to life in your language!</p>
          </div>
          <button
            onClick={handleListenWithAI}
            className="inline-flex items-center gap-2 bg-story-navy text-white font-nunito font-bold rounded-full px-6 py-3 shrink-0 hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200"
          >
            Listen Now <ChevronRight size={16} />
          </button>
          <div className="hidden md:block shrink-0">
            <ListenBannerKid />
          </div>
        </motion.div>
      </div>

      <Footer />

      <TranslateRequestModal
        book={translateRequest.book}
        language={translateRequest.language}
        onLanguageChange={translateRequest.setLanguage}
        submitting={translateRequest.submitting}
        onCancel={translateRequest.close}
        onSubmit={translateRequest.submit}
      />
    </div>
  );
}
