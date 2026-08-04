// Product/business constants for the Library page — centralized here instead of
// buried as magic numbers inside components, per the repo's Rules Engine principle.

import { BOOK_CATEGORIES } from '../../utils/mockData';

// Category chips reuse the single canonical taxonomy from mockData.js — no second
// hardcoded list to drift out of sync with what books are actually tagged with.
export const CATEGORY_CHIPS = BOOK_CATEGORIES;

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

// Literal, non-fabricated stat values for the Library header — this is a brand-new
// catalogue, so real usage is genuinely zero and the language count reflects what's
// actually supported today, not a projected/faked total.
export const LIBRARY_STATS_DISPLAY = {
  reads: { value: '0', label: 'Reads' },
  languages: { value: '7+', label: 'Languages' },
};

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reads', label: 'Most Read' },
  { value: 'az', label: 'Title A–Z' },
];

export function sortBooks(books, sortValue) {
  switch (sortValue) {
    case 'rating': return [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'reads':  return [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0));
    case 'az':     return [...books].sort((a, b) => a.title.localeCompare(b.title));
    default:       return books;
  }
}

export const CAROUSEL = {
  // How many cards are visible on each side of the centered card.
  SIDE_COUNT: 2,
  CENTER_SCALE: 1,
  SIDE_SCALE: 0.8,
  FAR_SCALE: 0.65,
  SIDE_OPACITY: 0.6,
  FAR_OPACITY: 0.3,
  CARD_SPACING_PX: 230,
  CENTER_LIFT_PX: 24,

  // Mobile: 3D "fan" layout — one large center card with the previous/next
  // cards peeking in from the edges, per the reference design.
  SIDE_COUNT_MOBILE: 1,
  SIDE_SCALE_MOBILE: 0.82,
  SIDE_OPACITY_MOBILE: 0.55,
  CARD_SPACING_MOBILE_PX: 132,
  CENTER_LIFT_MOBILE_PX: 14,
};

export const STORY_BOOKS_COUNT = 4;
export const EDUCATIONAL_SMALL_COUNT = 3;
