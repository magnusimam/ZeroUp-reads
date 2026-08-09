// Centralized business rules (Rules Engine principle) — named constants that
// business/product could tune without touching component or service code,
// instead of magic numbers buried inline. Not admin-editable yet (post-MVP),
// but living in one place is the prerequisite for that later.

// Used by booksService.createBook() to estimate a book's page count from its
// raw word count.
export const WORDS_PER_PAGE = 300;

// How many books the homepage's "Popular Books" section shows in total
// (sorted by reads, most first): 1 large featured card + the rest as a
// compact list, same "top pick + list" layout as the Library page's
// Educational Books section — used by PopularBooksSection.
export const POPULAR_BOOKS_HIGHLIGHT_COUNT = 4;

// Reader Dashboard (src/modules/dashboard) — how many "in progress" books the
// Continue Your Journey row shows before the rest scroll off-screen.
export const CONTINUE_JOURNEY_MAX_CARDS = 6;

// Achievement badges shown on the Reader Dashboard — thresholds against the
// same progress fields userService.getProgress() already tracks
// (booksCompleted, streak), so unlocking one is never a fabricated UI state.
// Centralised here (Rules Engine principle) so product can retune thresholds
// without touching dashboard component code.
export const ACHIEVEMENT_RULES = [
  { id: 'first-book', label: 'First Story Finished', icon: '📖', metric: 'booksCompleted', threshold: 1 },
  { id: 'five-books', label: 'Bookworm', icon: '🐛', metric: 'booksCompleted', threshold: 5 },
  { id: 'ten-books', label: 'Library Legend', icon: '🏆', metric: 'booksCompleted', threshold: 10 },
  { id: 'three-day-streak', label: '3-Day Streak', icon: '🔥', metric: 'streak', threshold: 3 },
  { id: 'seven-day-streak', label: 'Week of Wonder', icon: '⚡', metric: 'streak', threshold: 7 },
];

// Reader Dashboard "Reading Progress"/stats widgets — how a reader's raw
// persisted counters (pagesRead, booksCompleted) turn into the derived
// numbers those widgets show, instead of a screen-specific magic number.
// Average reading pace assumption reuses WORDS_PER_PAGE (above) at a rough
// 200 words/minute child-reading-speed rather than a value picked to match
// any particular target UI's numbers.
export const READING_MINUTES_PER_PAGE = WORDS_PER_PAGE / 200;

// Reader "Level" (shown next to their name) — every N completed books earns
// a level, starting at 1. Centralised here so the level shown in the top bar
// and the level shown anywhere else can never drift apart.
export const BOOKS_PER_READER_LEVEL = 2;

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// How many books the Reader Dashboard's "Recently Read" list shows, and how
// many category slices "Top Genres" breaks out before folding the remainder
// into a single "Others" slice.
export const DASHBOARD_RECENTLY_READ_COUNT = 3;
export const DASHBOARD_TOP_GENRES_COUNT = 4;

// Book Detail Page (src/modules/books/BookDetailPage.jsx) — how many related
// books to surface under a book, same "small fixed row" density as the
// dashboard's recently-read/top-genres rows above.
export const RELATED_BOOKS_COUNT = 4;

// Book Detail Page — a book's `attributes.tagline` is optional (Schema-Driven
// Design), so most books fall back to a tagline derived from their
// `description`. This caps that derived tagline's length so it still reads
// like a punchy hero line instead of a second paragraph.
export const TAGLINE_MAX_LENGTH = 90;

// Homepage SearchBar (src/components/home/discover/SearchBar.jsx) — how many
// live results the type-ahead dropdown shows before "+N more results" hands
// the rest off to the full Library page, so the dropdown never grows into an
// unbounded list as the catalogue does.
export const SEARCH_RESULTS_LIMIT = 6;

// Forgot Password (src/modules/auth) — how long a password-reset token stays
// valid after it's requested, before ResetPasswordPage refuses it and sends
// the reader back to request a fresh one.
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

// Reading Page (src/modules/reading/ReadingPage.jsx) — gamified "Reading
// Points" shown in ReaderSidebar, derived from the same persisted pagesRead
// counter userService already tracks (single source of truth), so points
// never drift out of sync with the dashboard's own page-count stats.
export const READING_POINTS_PER_PAGE = 5;

// Reading Page — how many glossary words (src/modules/reading/vocabulary.js)
// get highlighted with a tap-to-define popover on a single page, so a dense
// page of text doesn't turn into a wall of underlines.
export const MAX_VOCABULARY_WORDS_PER_PAGE = 3;
