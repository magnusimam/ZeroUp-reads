// Site-wide primary navigation + the "Explore" mega menu — kept as one
// shared config so Navbar.jsx (plain-style, used on every non-home page) and
// HeroNavbar.tsx (Tailwind, used only on the homepage hero) never drift into
// two different navigation structures (Modular Architecture: one source of
// truth for nav, not a copy per navbar implementation).

export const PRIMARY_NAV_LINKS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'explore', label: 'Explore', to: '/library', mega: true },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'resources', label: 'Resources', to: '/about' },
  { key: 'community', label: 'Community', to: '/about' },
];

export const EXPLORE_MEGA_MENU = [
  { icon: '📚', label: 'Books', description: 'Browse the full library', to: '/library' },
  { icon: '🌍', label: 'Languages', description: 'Read in your mother tongue', to: '/library' },
  { icon: '👶', label: 'Reading Levels', description: 'From first words to fluent', to: '/library' },
  { icon: '⭐', label: 'Featured Books', description: "This month's picks", to: '/library' },
  { icon: '🔥', label: 'Popular Books', description: 'What kids love right now', to: '/library' },
  { icon: '📖', label: 'Categories', description: 'Science, culture, adventure & more', to: '/library' },
];
