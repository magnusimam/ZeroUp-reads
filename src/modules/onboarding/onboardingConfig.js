import { BOOK_LANGUAGES, BOOK_CATEGORIES, BOOK_LEVELS } from '../../utils/mockData';
import { READING_LEVELS } from '../../components/home/discover/discoverConfig';

// 4 intro slides — the beautiful "here's what ZeroUp Reads is" run-up before
// the preference questions. Last one foreshadows offline reading.
export const INTRO_SLIDES = [
  {
    emoji: '📚',
    title: 'Welcome to ZeroUp Reads',
    text: "Storybooks and learning materials in African languages, made for every child's reading journey.",
  },
  {
    emoji: '🌍',
    title: 'Stories in your language',
    text: 'From Hausa to Yoruba to Swahili — read in the language that feels like home.',
  },
  {
    emoji: '🎯',
    title: 'Learn at your own level',
    text: "Every book is tagged by reading level, so you're never too far ahead or behind.",
  },
  {
    emoji: '📶',
    title: 'Read anywhere, even offline',
    text: 'Download your favourite books and keep reading even without an internet connection.',
  },
];

// Reuses the exact taxonomy every other picker in the app already reads from
// (mockData.js's BOOK_LANGUAGES/BOOK_CATEGORIES/BOOK_LEVELS, discoverConfig's
// age-tier cards) instead of inventing a parallel option list that could
// drift from what books are actually tagged with.
export const ONBOARDING_LANGUAGES = BOOK_LANGUAGES;
export const ONBOARDING_INTERESTS = BOOK_CATEGORIES;
export const ONBOARDING_LEVELS = BOOK_LEVELS;
export const ONBOARDING_AGE_GROUPS = READING_LEVELS;
