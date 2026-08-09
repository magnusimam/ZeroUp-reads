// "Did you know?" callout on the Reading Page. A book's own
// `attributes.funFacts` (Schema-Driven Design's extensible attributes bag)
// wins when present — one fact per content page, hand-authored for that
// story. Every other book still gets a fact instead of an empty callout,
// falling back to a small bank keyed by `category` (same closed taxonomy as
// BOOK_CATEGORIES in mockData.js) and cycling by page so a longer book
// doesn't repeat the same line on every page.
const FACTS_BY_CATEGORY = {
  History: [
    'A kingdom is a place ruled by a king or queen. It can be big or small.',
    'Oral history means passing stories down by speaking, not writing — for generations, this was how history was kept alive.',
    'Some African kingdoms, like Katsina and Kano, were important trading cities over 1,000 years ago.',
  ],
  Culture: [
    'Folktales were often used to teach lessons about honesty, courage, and kindness.',
    'Many African folktales feature clever animals who outsmart bigger, stronger ones.',
  ],
  Storybooks: [
    'The oldest known stories were told out loud, long before anyone learned to write them down.',
    'A "folktale" is a story passed down by a community, often with no single known author.',
  ],
  Science: [
    'Scientists ask questions and test ideas with experiments to find out what is true.',
    'Water can be a solid, liquid, or gas — ice, water, and steam are all the same substance!',
  ],
  Space: [
    'The Sun is so big that over a million Earths could fit inside it.',
    'It takes sunlight about 8 minutes to travel from the Sun to the Earth.',
  ],
  Technology: [
    'Computers only understand two states, on and off — every picture and word is built from patterns of just those two.',
    'The first computers were the size of a whole room, but were far slower than a modern phone.',
  ],
  Agriculture: [
    'A single seed carries everything a plant needs to begin growing.',
    'Some crops, like yam and cassava, grow their food underground, hidden from the sun.',
  ],
  Finance: [
    'Saving a little money regularly can grow into a lot over time.',
    'A budget is simply a plan for how to spend and save your money.',
  ],
  Health: [
    'Your heart beats about 100,000 times every single day without you ever thinking about it.',
    'The human body has five main senses: sight, hearing, smell, taste, and touch.',
  ],
  Animals: [
    'A gecko\'s feet are covered in thousands of tiny hairs that let it walk straight up glass.',
    'Ants leave an invisible scent trail so other ants in their colony can follow the same path.',
  ],
  Environment: [
    'A single tree can provide enough oxygen for two people to breathe for a whole year.',
    'Rainforests cover about 6% of Earth\'s land, but are home to over half of its plant and animal species.',
  ],
  Mathematics: [
    'Zero wasn\'t always considered a number — it took mathematicians centuries to accept it as one.',
  ],
  Arts: [
    'Every colour you can see is made from just three primary colours: red, yellow, and blue.',
  ],
  'Language & Culture': [
    'Nigeria alone is home to over 500 different languages.',
    'Learning a second language can change the way your brain solves problems.',
  ],
};

const DEFAULT_FACTS = [
  'Reading a little bit every day is one of the best ways to learn new words.',
  'The more languages a story is told in, the more people it can reach.',
];

// Small decorative icon shown beside the fact — purely presentational, keyed
// off the same category taxonomy as the fact banks above.
const ICON_BY_CATEGORY = {
  History: '🏰', Culture: '🎭', Storybooks: '📖', Science: '🔬', Space: '🚀',
  Technology: '💻', Agriculture: '🌾', Finance: '💰', Health: '❤️',
  Animals: '🦎', Environment: '🌳', Mathematics: '🔢', Arts: '🎨',
  'Language & Culture': '🌍',
};

export function getFunFact(book, pageIndex) {
  if (!book) return null;

  const authored = book.attributes?.funFacts;
  if (authored?.length) {
    return { text: authored[pageIndex % authored.length], icon: ICON_BY_CATEGORY[book.category] || '💡' };
  }

  const bank = FACTS_BY_CATEGORY[book.category] || DEFAULT_FACTS;
  return { text: bank[pageIndex % bank.length], icon: ICON_BY_CATEGORY[book.category] || '💡' };
}
