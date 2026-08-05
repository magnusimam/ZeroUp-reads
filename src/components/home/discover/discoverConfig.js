import { BOOK_LANGUAGES, BOOK_CATEGORIES } from '../../../utils/mockData';

// One accent colour per launch language so each pill in "Explore in your
// language" reads as its own chip (screenshot-matched) rather than a
// uniform list. Keyed by name so a language missing here just falls back to
// the rotation in ExploreLanguages instead of breaking.
export const LANGUAGE_PILL_COLORS = {
  Hausa: '#E8A020',
  Igbo: '#FF6B6B',
  Yoruba: '#3DBE8A',
  Efik: '#7C3AED',
  Tiv: '#F97316',
  Kanuri: '#2D6BE4',
  Pidgin: '#0D9488',
};

// All seven launch/Phase-2 languages are Nigerian, so every chip uses the
// same flag — kept as a per-language map (not a single constant) so a future
// non-Nigerian language slots in without a code change here.
const LANGUAGE_FLAGS = {
  Hausa: '🇳🇬', Igbo: '🇳🇬', Yoruba: '🇳🇬', Efik: '🇳🇬', Tiv: '🇳🇬', Kanuri: '🇳🇬', Pidgin: '🇳🇬',
};

// Chips shown on the homepage's language section — the launch languages
// (docs/ZEROUP_READS_CONCEPT.md §4.4 Phase 1: Hausa, Yoruba, Igbo, Pidgin)
// plus the first Phase 2 additions (Kanuri, Tiv, Efik). Filtered against the
// canonical BOOK_LANGUAGES taxonomy so a chip here can never point at a
// language no book/admin dropdown recognizes (Principle 4's recurring
// taxonomy-drift bug — see ENGINEERING_PRINCIPLES_TRACKER.md).
export const POPULAR_LANGUAGES = ['Hausa', 'Yoruba', 'Igbo', 'Efik', 'Tiv', 'Kanuri', 'Pidgin']
  .filter((lang) => BOOK_LANGUAGES.includes(lang))
  .map((name) => ({ name, color: LANGUAGE_PILL_COLORS[name] || 'var(--navy)', flag: LANGUAGE_FLAGS[name] || '🌍' }));

// Icon + accent colour per homepage category chip. The display order below is
// the product's actual content-domain priority list; filtered against the
// canonical BOOK_CATEGORIES taxonomy so a chip can never point at a category
// no book/admin dropdown recognizes.
const CATEGORY_META = {
  Science: { icon: '🔬', color: '#2D6BE4' },
  Technology: { icon: '💻', color: '#0D9488' },
  AI: { icon: '🤖', color: '#7C3AED' },
  Health: { icon: '🩺', color: '#3DBE8A' },
  Space: { icon: '🚀', color: '#1E2A6E' },
  Agriculture: { icon: '🌾', color: '#4E7A2F' },
  Finance: { icon: '💰', color: '#B8862E' },
  History: { icon: '📜', color: '#A9762F' },
  Culture: { icon: '🎭', color: '#C0863A' },
  Adventure: { icon: '🧭', color: '#E0653A' },
  Animals: { icon: '🐾', color: '#8A5A2F' },
  Environment: { icon: '🌿', color: '#2F8A6E' },
};

export const HOMEPAGE_CATEGORIES = Object.keys(CATEGORY_META)
  .filter((cat) => BOOK_CATEGORIES.includes(cat))
  .map((name) => ({ name, ...CATEGORY_META[name] }));

// The product doc (docs/ZEROUP_READS_CONCEPT.md §7, "Content Structure by
// Reading Level") defines 4 age-based tiers. The book schema's BOOK_LEVELS
// taxonomy (mockData.js) only has 3 values (Beginner/Intermediate/Advanced) —
// that's what every mock book's `level` field actually uses today. Rather
// than inventing a 4th filter value nothing would ever match, each tier below
// maps to the closest real BOOK_LEVELS value so these cards always resolve to
// real books on the Library page.
export const READING_LEVELS = [
  { key: 'beginner', label: 'Beginner', ageRange: 'Ages 3–6', emoji: '🐣📖', accent: '#D97706', bg: '#FEF3C7', libraryLevel: 'Beginner' },
  { key: 'growing', label: 'Growing Reader', ageRange: 'Ages 6–9', emoji: '🧒🌳', accent: '#16A34A', bg: '#DCFCE7', libraryLevel: 'Beginner' },
  { key: 'explorer', label: 'Explorer', ageRange: 'Ages 9–12', emoji: '🧑‍🚀📖', accent: '#2563EB', bg: '#DBEAFE', libraryLevel: 'Intermediate' },
  { key: 'advanced', label: 'Advanced', ageRange: 'Ages 12+', emoji: '🌌📖', accent: '#0F172A', bg: '#E2E8F0', libraryLevel: 'Advanced' },
];
