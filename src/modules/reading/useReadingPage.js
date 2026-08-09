import { useEffect, useMemo, useState } from 'react';
import * as booksService from '../books/booksService';
import * as offlineService from './offlineService';
import useOnlineStatus from './useOnlineStatus';
import * as userService from '../../services/userService';
import * as eventBus from '../../utils/eventBus';
import * as settingsService from '../settings/settingsService';
import * as bookmarksService from './bookmarksService';
import * as notesService from './notesService';
import useTranslateRequest from '../library/useTranslateRequest';
import { pickVocabularyWords } from './vocabulary';
import { getFunFact } from './funFacts';
import { MAX_VOCABULARY_WORDS_PER_PAGE } from '../../config/rules';
import { useToast } from '../../context/ToastContext';

// All of ReadingPage's state and business logic (Separation of Concerns) —
// the page component only reads what this hook returns and calls its
// actions, so a fresh reviewer can tell "what does this screen do" from this
// one file instead of hunting through JSX.
export default function useReadingPage(bookId) {
  const toast = useToast();
  const online = useOnlineStatus();
  const translateRequest = useTranslateRequest();

  // Prefer the offline-downloaded copy while offline — falls back to it
  // regardless if the live copy is somehow missing, so a downloaded book
  // never becomes unreadable just because the network state flapped.
  const liveBook = booksService.getBook(bookId);
  const offlineBook = offlineService.getOfflineBook(bookId);
  const book = (!online && offlineBook) ? offlineBook : (liveBook || offlineBook);
  const readingOffline = !online && Boolean(offlineBook);

  const [pageIndex, setPageIndex] = useState(0);
  const [fontSize, setFontSize] = useState(() => settingsService.getSettings().readerFontSize);
  const [nightMode, setNightMode] = useState(() => settingsService.getSettings().readerNightMode);
  const [saved, setSaved] = useState(() => bookmarksService.isBookmarked(bookId));
  const [pageBookmark, setPageBookmark] = useState(() => bookmarksService.getPageBookmark(bookId));
  const [speaking, setSpeaking] = useState(false);
  const [translateMenuOpen, setTranslateMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => notesService.getNotes(bookId));

  useEffect(() => {
    if (!book) return;
    setSaved(bookmarksService.isBookmarked(book.id));
    setPageBookmark(bookmarksService.getPageBookmark(book.id));
    setNotes(notesService.getNotes(book.id));
  }, [book]);

  // Real per-book progress (Continue Reading on the homepage reads this
  // instead of two hardcoded books being shown as "in progress" for everyone).
  useEffect(() => {
    if (book) userService.recordProgress(book.id, pageIndex + 1, book.content.length);
  }, [book, pageIndex]);

  useEffect(() => {
    settingsService.saveSettings({ readerFontSize: fontSize });
  }, [fontSize]);

  useEffect(() => {
    settingsService.saveSettings({ readerNightMode: nightMode });
  }, [nightMode]);

  // Stop any in-progress narration the moment the page changes or the
  // reader navigates away — an utterance reading page 2 while page 3 is on
  // screen would be more confusing than no narration at all.
  useEffect(() => {
    setSpeaking(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, [pageIndex, book?.id]);

  const totalPages = book?.content?.length || 0;
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === totalPages - 1;
  const progressPercent = totalPages ? Math.round(((pageIndex + 1) / totalPages) * 100) : 0;

  const vocabularyMatches = useMemo(
    () => pickVocabularyWords(book?.content?.[pageIndex], MAX_VOCABULARY_WORDS_PER_PAGE),
    [book, pageIndex]
  );

  const funFact = useMemo(() => getFunFact(book, pageIndex), [book, pageIndex]);

  const availableLanguages = book?.attributes?.availableLanguages?.length
    ? book.attributes.availableLanguages
    : book ? [book.language] : [];

  function nextPage() {
    if (!isLastPage) {
      setPageIndex((i) => i + 1);
    } else {
      eventBus.emit('book.completed', { id: book.id, title: book.title });
      toast?.addToast(`You finished "${book.title}"!`, 'success');
    }
  }

  function prevPage() {
    if (!isFirstPage) setPageIndex((i) => i - 1);
  }

  function goToPage(index) {
    setPageIndex(index);
    setContentsOpen(false);
  }

  function increaseFont() {
    setFontSize((f) => Math.min(f + 2, 28));
  }

  function decreaseFont() {
    setFontSize((f) => Math.max(f - 2, 14));
  }

  function toggleNightMode() {
    setNightMode((v) => !v);
  }

  function toggleSave() {
    const updated = bookmarksService.toggleBookmark(book.id);
    const isSaved = updated.includes(book.id);
    setSaved(isSaved);
    toast?.addToast(isSaved ? `Saved "${book.title}"` : `Removed "${book.title}" from Saved`, 'success');
  }

  function togglePageBookmark() {
    const bookmarked = bookmarksService.setPageBookmark(book.id, pageIndex);
    setPageBookmark(bookmarked);
    toast?.addToast(bookmarked === pageIndex ? `Bookmarked page ${pageIndex + 1}` : 'Bookmark removed', 'info');
  }

  function toggleListen() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast?.addToast('Listen isn\'t supported in this browser yet.', 'info');
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(book.content[pageIndex]);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  function selectAvailableLanguage(language) {
    setTranslateMenuOpen(false);
    if (language === book.language) return;
    toast?.addToast(`Full in-language reading in ${language} is coming soon — try Listen for now.`, 'info');
  }

  function openMoreLanguages() {
    setTranslateMenuOpen(false);
    translateRequest.open(book);
  }

  function addNote(text) {
    notesService.addNote(book.id, pageIndex, text);
    setNotes(notesService.getNotes(book.id));
  }

  function deleteNote(noteId) {
    notesService.deleteNote(book.id, noteId);
    setNotes(notesService.getNotes(book.id));
  }

  return {
    online, book, readingOffline,
    pageIndex, totalPages, isFirstPage, isLastPage, progressPercent,
    fontSize, nightMode, saved, pageBookmark, speaking,
    translateMenuOpen, settingsOpen, contentsOpen, notesOpen, focusMode,
    notes, vocabularyMatches, funFact, availableLanguages, translateRequest,
    nextPage, prevPage, goToPage,
    increaseFont, decreaseFont, toggleNightMode,
    toggleSave, togglePageBookmark, toggleListen,
    setTranslateMenuOpen, selectAvailableLanguage, openMoreLanguages,
    setSettingsOpen, setContentsOpen, setNotesOpen,
    setFocusMode: () => setFocusMode((v) => !v),
    addNote, deleteNote,
  };
}
