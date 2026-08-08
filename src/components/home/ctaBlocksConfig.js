// The homepage's 3-way call-to-action strip — each block routes to the
// closest real destination this app has today rather than a dead link.
// `illustration` is the emoji cluster rendered as this card's "large
// illustration" (item 11 of the homepage brief) — kept as data, not JSX, so
// swapping in real artwork later is a one-line change per block.
export const CTA_BLOCKS = [
  {
    key: 'translate',
    icon: 'languages',
    bg: '#7C3AED',
    title: 'Translate',
    body: 'Pick any book in the library and get it translated into your language.',
    ctaLabel: 'Translate a Book',
    ctaTo: '/library',
    illustration: ['📚', '🔤', '🗣️'],
  },
  {
    key: 'read',
    icon: 'bookOpen',
    bg: '#3DBE8A',
    title: 'Read',
    body: 'Explore thousands of books in your language.',
    ctaLabel: 'Start Reading',
    ctaTo: '/library',
    illustration: ['🌳', '📖', '✨'],
  },
  {
    key: 'support',
    icon: 'heart',
    bg: '#F97316',
    title: 'Support',
    body: 'Support our mission and help children read and learn.',
    ctaLabel: 'Become a Partner',
    ctaTo: '/about',
    illustration: ['🤝', '❤️', '📖'],
  },
];
