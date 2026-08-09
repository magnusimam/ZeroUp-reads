import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, Headphones, Languages, Type, Moon, Sun,
  List, Bookmark, StickyNote, Settings, BookOpen, ChevronLeft, ChevronRight, Volume2,
} from 'lucide-react';
import BookCoverArt from '../books/BookCoverArt';
import ReaderSidebar from './components/ReaderSidebar';
import TranslateMenu from './components/TranslateMenu';
import ReadingText from './components/ReadingText';
import DidYouKnowCard from './components/DidYouKnowCard';
import ContentsDrawer from './components/ContentsDrawer';
import NotesDrawer from './components/NotesDrawer';
import ReadingSettingsPanel from './components/ReadingSettingsPanel';
import TranslateRequestModal from '../library/components/TranslateRequestModal';
import * as userService from '../../services/userService';
import useReadingPage from './useReadingPage';

// Small icon-over-label header action (Save / Listen / Translate / Text
// Size / Night Mode) — page-local, not reused elsewhere, same pattern
// BookDetailPage uses for its own local InfoPill/StarRating helpers.
function HeaderAction({ icon: Icon, label, active, filled, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 group">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
        active ? 'bg-story-orange border-story-orange text-white' : 'bg-white border-story-navy/10 text-story-navy shadow-story-card group-hover:border-story-orange/40'
      }`}>
        <Icon size={17} fill={filled ? 'currentColor' : 'none'} />
      </span>
      <span className={`text-[11px] font-nunito font-bold ${active ? 'text-story-orange' : 'text-ink-secondary'}`}>{label}</span>
    </button>
  );
}

// Bottom-toolbar icon+label pair (Contents / Bookmark / Notes / Settings).
function ToolbarButton({ icon: Icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1">
      <Icon size={19} className={active ? 'text-story-orange' : 'text-ink-secondary'} fill={active ? 'currentColor' : 'none'} />
      <span className={`text-[11px] font-nunito font-bold ${active ? 'text-story-orange' : 'text-ink-secondary'}`}>{label}</span>
    </button>
  );
}

// Immersive, sidebar-driven reading experience — its own app shell (own
// sidebar + header, no marketing Navbar/Footer), same reasoning as the
// Reader Dashboard: a signed-in-feeling screen, not a public marketing page.
// Page itself stays presentational; all state/logic lives in useReadingPage
// (Separation of Concerns).
export default function ReadingPage() {
  const { bookId } = useParams();
  const reading = useReadingPage(bookId);
  const { book } = reading;

  if (!book) {
    return (
      <div style={{ background: 'var(--hero-cream)' }} className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">📖</p>
          <h1 className="text-xl font-bold text-story-navy font-nunito">Book not found</h1>
          <Link to="/library" className="text-story-orange font-nunito font-bold text-sm mt-3 inline-block">
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const streak = userService.getProgress().streak || 0;
  const points = userService.getReadingPoints();

  return (
    <div style={{ background: 'var(--hero-cream)', minHeight: '100vh' }} className="reader-shell flex gap-6 p-6">
      {!reading.focusMode && <ReaderSidebar streak={streak} points={points} />}

      <main className="flex-1 min-w-0 flex flex-col gap-5 max-w-4xl mx-auto w-full pb-32 font-nunito-sans">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/library"
              aria-label="Back to Library"
              className="w-10 h-10 rounded-full bg-white border border-story-navy/10 flex items-center justify-center text-story-navy hover:bg-story-cream shadow-story-card shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-nunito font-extrabold text-story-navy text-lg leading-tight">{book.title}</h1>
              <p className="text-ink-secondary text-xs font-nunito font-bold">
                {book.category} • {book.level}
                {reading.readingOffline && <span className="ml-2 text-green">• Reading offline 📶</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <HeaderAction icon={Star} label="Save" active={reading.saved} filled={reading.saved} onClick={reading.toggleSave} />
            <HeaderAction icon={Headphones} label="Listen" active={reading.speaking} onClick={reading.toggleListen} />
            <div className="relative">
              <HeaderAction
                icon={Languages}
                label="Translate"
                active={reading.translateMenuOpen}
                onClick={() => reading.setTranslateMenuOpen((v) => !v)}
              />
              {reading.translateMenuOpen && (
                <TranslateMenu
                  book={book}
                  availableLanguages={reading.availableLanguages}
                  onSelectAvailable={reading.selectAvailableLanguage}
                  onMoreLanguages={reading.openMoreLanguages}
                />
              )}
            </div>
            <HeaderAction icon={Type} label="Text Size" onClick={() => reading.setSettingsOpen(true)} />
            <HeaderAction
              icon={reading.nightMode ? Sun : Moon}
              label="Night Mode"
              active={reading.nightMode}
              onClick={reading.toggleNightMode}
            />
          </div>
        </div>

        {/* Hero image */}
        <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden shadow-story-card">
          <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
        </div>

        {/* Page content */}
        <div className={`relative rounded-3xl border px-6 py-7 sm:px-9 sm:py-9 shadow-story-card transition-colors ${
          reading.nightMode ? 'bg-midnight-light border-white/5' : 'bg-white border-story-navy/8'
        }`}>
          <ReadingText
            text={book.content[reading.pageIndex]}
            matches={reading.vocabularyMatches}
            className={`leading-relaxed transition-all ${reading.nightMode ? 'text-white/90' : 'text-ink-primary'}`}
            style={{ fontSize: `${reading.fontSize}px` }}
          />
          <DidYouKnowCard fact={reading.funFact} />
        </div>
      </main>

      {/* Floating listen button */}
      <button
        type="button"
        onClick={reading.toggleListen}
        aria-label={reading.speaking ? 'Stop listening' : 'Listen to this page'}
        className={`fixed bottom-32 right-6 sm:right-10 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-story-float transition-colors ${
          reading.speaking ? 'bg-story-orange' : 'bg-story-navy'
        } text-white`}
      >
        <Volume2 size={22} />
      </button>

      {/* Bottom progress + toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-story-navy/10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={reading.prevPage}
            disabled={reading.isFirstPage}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-story-navy text-white text-sm font-nunito font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Previous
          </button>

          <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xs mx-auto">
            <span className="text-xs font-nunito font-bold text-ink-secondary">
              Page {reading.pageIndex + 1} of {reading.totalPages} • {reading.progressPercent}%
            </span>
            <div className="w-full h-1.5 rounded-full bg-story-navy/10 overflow-hidden">
              <div className="h-full bg-story-orange rounded-full transition-all" style={{ width: `${reading.progressPercent}%` }} />
            </div>
          </div>

          <button
            type="button"
            onClick={reading.nextPage}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-story-orange text-white text-sm font-nunito font-bold hover:bg-story-orange-dark"
          >
            {reading.isLastPage ? 'Finish' : 'Next'} <ChevronRight size={15} />
          </button>
        </div>

        <div className="border-t border-story-navy/8 px-6 py-2.5 flex items-center justify-around">
          <ToolbarButton icon={List} label="Contents" onClick={() => reading.setContentsOpen(true)} />
          <ToolbarButton
            icon={Bookmark}
            label="Bookmark"
            active={reading.pageBookmark === reading.pageIndex}
            onClick={reading.togglePageBookmark}
          />
          <button
            type="button"
            onClick={reading.setFocusMode}
            aria-label={reading.focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            title={reading.focusMode ? 'Exit focus mode' : 'Distraction-free reading'}
            className="w-12 h-12 -mt-6 rounded-full bg-story-orange text-white flex items-center justify-center shadow-story-float hover:bg-story-orange-dark transition-colors"
          >
            <BookOpen size={20} />
          </button>
          <ToolbarButton icon={StickyNote} label="Notes" onClick={() => reading.setNotesOpen(true)} />
          <ToolbarButton icon={Settings} label="Settings" onClick={() => reading.setSettingsOpen(true)} />
        </div>
      </div>

      <ContentsDrawer
        open={reading.contentsOpen}
        onClose={() => reading.setContentsOpen(false)}
        content={book.content}
        currentIndex={reading.pageIndex}
        bookmarkedIndex={reading.pageBookmark}
        onJump={reading.goToPage}
      />
      <NotesDrawer
        open={reading.notesOpen}
        onClose={() => reading.setNotesOpen(false)}
        notes={reading.notes}
        pageIndex={reading.pageIndex}
        onAdd={reading.addNote}
        onDelete={reading.deleteNote}
      />
      <ReadingSettingsPanel
        open={reading.settingsOpen}
        onClose={() => reading.setSettingsOpen(false)}
        fontSize={reading.fontSize}
        onIncrease={reading.increaseFont}
        onDecrease={reading.decreaseFont}
        nightMode={reading.nightMode}
        onToggleNightMode={reading.toggleNightMode}
      />

      <TranslateRequestModal
        book={reading.translateRequest.book}
        language={reading.translateRequest.language}
        onLanguageChange={reading.translateRequest.setLanguage}
        submitting={reading.translateRequest.submitting}
        onCancel={reading.translateRequest.close}
        onSubmit={reading.translateRequest.submit}
      />

      <style>{`
        @media (max-width: 900px) {
          .reader-shell { flex-direction: column; padding: 16px !important; }
          .reader-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
