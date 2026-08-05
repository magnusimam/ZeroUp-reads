// Schema for the hero slider's slides. Keeping copy/CTAs/images here (not
// hardcoded in JSX) is what lets HeroSection stay a dumb renderer and lets a
// new slide be added without touching component code.

export interface HeroHeadingSegment {
  text: string;
  accent?: boolean;
}

export interface HeroCta {
  label: string;
  to: string;
}

/** A slide fully authored in code: real headline, subtext and CTAs over a right-aligned illustration. */
export interface IllustratedHeroSlide {
  kind: 'illustrated';
  id: string;
  headingLines: HeroHeadingSegment[][];
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  illustration: string;
  illustrationAlt: string;
}

export type HeroSlideData = IllustratedHeroSlide;

export const heroSlides: HeroSlideData[] = [
  {
    kind: 'illustrated',
    id: 'story-time',
    headingLines: [
      [{ text: 'Every Child' }],
      [{ text: 'Deserves a Story', accent: true }],
      [{ text: 'in Their Own Language.' }],
    ],
    description:
      'Discover beautiful books written in African languages and made for every young reader.',
    primaryCta: { label: 'Start Reading', to: '/library' },
    secondaryCta: { label: 'Explore Library', to: '/library' },
    illustration: '/assets/hero/slide-1-storytime.jpg',
    illustrationAlt:
      'Four children reading books together under a glowing tree of books, with birds, butterflies and floating books around them',
  },
  {
    kind: 'illustrated',
    id: 'invent-tomorrow',
    headingLines: [
      [{ text: 'What Will You' }],
      [{ text: 'Invent Tomorrow?', accent: true }],
    ],
    description:
      'Explore amazing books about technology, AI, robots and the future we can build together.',
    primaryCta: { label: 'Discover AI & Tech Books', to: '/library' },
    secondaryCta: { label: 'Explore Library', to: '/library' },
    illustration: '/assets/hero/slide-2-invent-tomorrow-art.jpg',
    illustrationAlt:
      'A boy pointing excitedly at futuristic AI and robotics holograms beside a friendly robot companion in a sci-fi city',
  },
  {
    kind: 'illustrated',
    id: 'universe-discovered',
    headingLines: [
      [{ text: 'The Universe Is' }],
      [{ text: 'Waiting to Be Discovered.', accent: true }],
    ],
    description:
      'Explore amazing books about space, stars, planets and the endless wonders beyond.',
    primaryCta: { label: 'Explore Space Books', to: '/library' },
    secondaryCta: { label: 'Explore Library', to: '/library' },
    illustration: '/assets/hero/slide-3-universe-art.jpg',
    illustrationAlt:
      'A boy sitting cross-legged atop a giant open book, reading as a rocket launches toward the planets and a distant galaxy',
  },
];

export interface HeroStat {
  icon: 'chat' | 'book' | 'globe' | 'ai' | 'gift';
  value: string;
  label: string;
}

export const heroStats: HeroStat[] = [
  { icon: 'chat', value: '500+', label: 'Languages' },
  { icon: 'book', value: 'Thousands', label: 'of Stories' },
  { icon: 'globe', value: 'Across', label: 'Africa' },
  { icon: 'ai', value: 'AI', label: 'Powered' },
  { icon: 'gift', value: 'Free', label: "Children's Books" },
];

