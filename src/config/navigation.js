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
  // Each item lands on its exact section, not the top of the Library:
  // homepage pickers for levels/categories, the Library's Featured carousel,
  // and the Library's book list sorted by most read.
  { icon: '👶', label: 'Reading Levels', description: 'From first words to fluent', to: '/#reading-levels' },
  { icon: '⭐', label: 'Featured Books', description: "This month's picks", to: '/library#featured' },
  { icon: '🔥', label: 'Popular Books', description: 'What kids love right now', to: '/library?sort=reads' },
  { icon: '📖', label: 'Categories', description: 'Science, culture, adventure & more', to: '/#browse-categories' },
  { icon: '👪', label: 'Parents & Teachers', description: 'Suggested books for home and class', to: '/parents-teachers' },
];
