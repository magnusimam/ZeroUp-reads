import { BOOK_CATEGORIES } from '../../utils/mockData';

// Reader Dashboard's "Explore by Category" tiles. Labels are the
// friendlier, kid-facing names from the dashboard's design reference; each
// still resolves to a real BOOK_CATEGORIES value (filtered below) so a tile
// can never link the reader to a category the Library filter/Admin dropdown
// doesn't recognise — same guardrail discoverConfig.js uses for the
// homepage's category chips. Where a reference label doesn't map 1:1 onto
// the taxonomy (e.g. "Everyday Heroes", "STEM Explorers"), it's pointed at
// the closest existing category with real books today (Storybooks, Science)
// rather than inventing a new taxonomy value.
const CATEGORY_TILES = [
  { label: 'History Stories', category: 'History', icon: '📜', accent: '#A9762F' },
  { label: 'Finance Adventures', category: 'Finance', icon: '💰', accent: '#B8862E' },
  { label: 'AI & Tech Tales', category: 'Technology', icon: '🤖', accent: '#2E6FE0' },
  { label: 'STEM Explorers', category: 'Science', icon: '🔬', accent: '#1F8A82' },
  { label: 'Everyday Heroes', category: 'Storybooks', icon: '🦸', accent: '#E0653A' },
  { label: 'Culture & Heritage', category: 'Culture', icon: '🎭', accent: '#C0863A' },
];

export const DASHBOARD_CATEGORIES = CATEGORY_TILES.filter((tile) => BOOK_CATEGORIES.includes(tile.category));

// Solid accent per category for small UI (progress bars, badges) that can't
// use BookCoverArt's full illustrated gradient — picked to echo that same
// per-category palette (src/modules/books/BookCoverArt.jsx) so a category
// reads as the same colour everywhere it appears, not a second clashing set.
const CATEGORY_ACCENT = {
  Storybooks: '#8A4FC0', Science: '#1F8A82', Technology: '#2E6FE0', History: '#A9762F',
  Mathematics: '#A0304F', Health: '#3D8A4E', Arts: '#A0349E', 'Language & Culture': '#C06B3A',
  AI: '#7C3AED', Space: '#1E2A6E', Agriculture: '#4E7A2F', Finance: '#B8862E',
  Culture: '#C0863A', Adventure: '#E0653A', Animals: '#8A5A2F', Environment: '#2F8A6E',
};

export function getCategoryAccent(category) {
  return CATEGORY_ACCENT[category] || 'var(--hero-orange)';
}
