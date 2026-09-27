// Product/business constants for the Library page — centralized here instead of
// buried as magic numbers inside components, per the repo's Rules Engine principle.

// Topics the Educational Books "Choose Topic" dropdown offers — restricted to
// categories that actually have educational books today (Science, History,
// Language & Culture). A list including e.g. "Technology"/"Mathematics" with
// zero matching books silently emptied the section for that choice; add a
// topic here only once a real book exists in it.
export const EDUCATIONAL_TOPICS = ['Science', 'History', 'Language & Culture'];

// Story-specific themes for the Story Books "Select Theme" dropdown — tagged
// per-book via book.attributes.theme (Schema-Driven Design's extensible-metadata
// bag), not the general BOOK_CATEGORIES taxonomy used by the top category chips.
// Same rule as EDUCATIONAL_TOPICS: only list a theme once a real book has it.
export const STORY_THEMES = [
  'Folktales & Legends', 'Adventure', 'Fantasy', 'Nature & Environment',
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reads', label: 'Most Read' },
  { value: 'az', label: 'Title A–Z' },
];

// Minimum number of real-cover books needed before a section switches to
// showing only those — below this, falling back to the full (mostly
// placeholder-cover) list looks less broken than a near-empty section.
const MIN_COVERED_FOR_PREFERENCE = 3;

// Prefer titles with a real cover photo over the plain color+icon
// placeholder — used by Featured Books, Story Books and Educational Books
// so the sections readers see by default showcase real artwork first,
// until more covers exist. Callers skip this during an active search/filter,
// where a reader wants the true matching results, not a curated subset.
export function preferCoveredBooks(list) {
  const covered = list.filter(b => b.coverUrl);
  return covered.length >= MIN_COVERED_FOR_PREFERENCE ? covered : list;
}

export function sortBooks(books, sortValue) {
  switch (sortValue) {
    case 'rating': return [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'reads':  return [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0));
    case 'az':     return [...books].sort((a, b) => a.title.localeCompare(b.title));
    default:       return books;
  }
}

// Row of near-equal cards with just the center one raised and slightly
// bigger — a flat shelf, not the old 3D coverflow fan — matching the
// reference design's Featured Books strip.
export const CAROUSEL = {
  SIDE_COUNT: 2,
  CENTER_SCALE: 1.08,
  SIDE_SCALE: 0.94,
  FAR_SCALE: 0.88,
  SIDE_OPACITY: 1,
  FAR_OPACITY: 0.9,
  CARD_SPACING_PX: 186,
  CENTER_LIFT_PX: 18,

  // Tighter than the desktop numbers so a side card's edge stays inside a
  // ~360-414px phone viewport (card width 140px, so a card centered
  // 112px off-center spans roughly 42-182px from the stage's own center —
  // mostly on-screen) instead of getting cut off almost entirely.
  SIDE_COUNT_MOBILE: 1,
  SIDE_SCALE_MOBILE: 0.88,
  SIDE_OPACITY_MOBILE: 0.85,
  CARD_SPACING_MOBILE_PX: 112,
  CENTER_LIFT_MOBILE_PX: 12,
};

export const STORY_BOOKS_COUNT = 6;
export const EDUCATIONAL_SMALL_COUNT = 6;

// Canonical display order for the sidebar's "Age Group" filter — the field
// itself (book.ageGroup) already exists on every book; this just keeps the
// dropdown from listing values in whatever order Set-dedup happens to yield.
export const AGE_GROUP_ORDER = ['Children', 'Young Adult', 'Student'];

// Curated subset of BOOK_CATEGORIES the Library hero shows as inline pills
// (the rest are still reachable via "More" → the filter panel's full
// Category list) — kept short and visually varied rather than just the
// taxonomy's first N entries, which would front-load near-duplicates
// (Storybooks/Science/Technology/AI all cluster at the top of the list).
export const HERO_CATEGORY_CHIPS = ['Science', 'Technology', 'Animals', 'Adventure', 'Culture', 'Health'];
