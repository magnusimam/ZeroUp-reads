// Copy + rules for the public "Translate a Story" page (/translate).

// How many stories the "Pick a story" grid shows before "Show more".
export const STORY_PICKER_PAGE_SIZE = 8;

export const HOW_IT_WORKS_STEPS = [
  { icon: '📚', title: 'Pick a story', text: 'Choose any book from our library — science, AI, folktales, health and more.' },
  { icon: '🌍', title: 'Pick your language', text: 'Hausa, Yoruba, Igbo, Swahili and more. Read in the language you understand best.' },
  { icon: '⚡', title: 'We translate it instantly', text: 'Each page is translated as you read, in a moment, right in the reader.' },
  { icon: '🔁', title: 'Switch back anytime', text: 'Tap "Show original" to compare with the original words whenever you like.' },
];

export const TRANSLATE_FAQ = [
  {
    q: 'Is it free?',
    a: 'Yes. Translating and reading stories is free for every reader.',
  },
  {
    q: 'How accurate is it?',
    a: "It's machine translation, so it's good for understanding a story but it isn't perfect — names, proverbs and some words may come out oddly. Where our team has already translated a book by hand, we open that version instead.",
  },
  {
    q: 'Does it work offline?',
    a: "Translating needs an internet connection. Pages you've translated once are saved on your device, so you can read them again offline.",
  },
  {
    q: 'Which languages can I choose?',
    a: 'Hausa, Yoruba, Igbo, Swahili, Amharic, Zulu, French, Arabic, Portuguese and English. Kanuri, Tiv, Efik and Pidgin aren\'t available for instant translation yet — you can request a human translation for those.',
  },
];
