// Flat color + icon per book category, for the bright "tile" card style
// (Library's Featured Books side cards, All Books grid, category chips).
// A separate concern from BookCoverArt's dark illustrated-cover gradients —
// this is the single source of truth for the flat palette so a category
// reads as the same color everywhere it appears in that style, instead of
// each screen picking its own (Modular Architecture).
export const CATEGORY_TILE_THEME = {
  Storybooks: { color: 'coral', icon: '📖' },
  Science: { color: 'sky-blue', icon: '🔬' },
  Technology: { color: 'violet', icon: '💻' },
  AI: { color: 'violet', icon: '🤖' },
  Health: { color: 'coral', icon: '❤️' },
  Space: { color: 'navy', icon: '🚀' },
  Agriculture: { color: 'green', icon: '🌾' },
  Finance: { color: 'amber', icon: '💰' },
  History: { color: 'amber', icon: '🏛️' },
  Culture: { color: 'coral', icon: '🎭' },
  Adventure: { color: 'amber', icon: '🧭' },
  Animals: { color: 'amber', icon: '🐾' },
  Environment: { color: 'green', icon: '🌿' },
  Mathematics: { color: 'sky-blue', icon: '➗' },
  Arts: { color: 'violet', icon: '🎨' },
  'Language & Culture': { color: 'coral', icon: '🗣️' },
};

const DEFAULT_TILE_THEME = { color: 'navy', icon: '📚' };

export function getCategoryTileTheme(category) {
  return CATEGORY_TILE_THEME[category] || DEFAULT_TILE_THEME;
}

// Tailwind needs full literal class strings (no `bg-${color}` interpolation)
// for its static scanner to generate them — same pattern LibraryHero already
// uses for its category-chip colors.
export const TILE_COLOR_CLASSES = {
  coral: { block: 'bg-coral', chip: 'bg-white/90 text-coral', btn: 'bg-coral hover:bg-coral/90' },
  'sky-blue': { block: 'bg-sky-blue', chip: 'bg-white/90 text-sky-blue', btn: 'bg-sky-blue hover:bg-sky-blue/90' },
  violet: { block: 'bg-violet', chip: 'bg-white/90 text-violet', btn: 'bg-violet hover:bg-violet/90' },
  navy: { block: 'bg-navy', chip: 'bg-white/90 text-navy', btn: 'bg-navy hover:bg-navy/90' },
  green: { block: 'bg-green', chip: 'bg-white/90 text-green', btn: 'bg-green hover:bg-green/90' },
  amber: { block: 'bg-amber', chip: 'bg-white/90 text-amber', btn: 'bg-amber hover:bg-amber/90' },
};

export function getTileColorClasses(category) {
  return TILE_COLOR_CLASSES[getCategoryTileTheme(category).color];
}
