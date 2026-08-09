// Reader-facing vocabulary glossary (docs/ZEROUP_READS_CONCEPT.md §"Flash
// Cards and Visual Aids" — vocabulary-building is a named product feature,
// not invented here). Kid-friendly definitions for words that actually show
// up across MOCK_BOOKS' content, so the reading page's tap-to-define
// highlighting has real matches on most books, not just one demo title.
export const VOCABULARY = {
  wise: 'Having good judgment and understanding.',
  brave: 'Ready to face danger or difficulty without fear.',
  courage: 'The ability to do something that frightens you.',
  kingdom: 'A place ruled by a king or queen. It can be big or small.',
  leader: 'A person who guides or directs a group of people.',
  clever: 'Quick to understand, learn, and solve problems.',
  curious: 'Eager to know or learn something.',
  curiosity: 'A strong desire to know or learn something.',
  patient: 'Able to wait calmly without getting upset.',
  patience: 'The ability to stay calm while waiting for something.',
  ancient: 'Belonging to a time long, long ago.',
  elder: 'An older person, often respected for their wisdom.',
  elders: 'Older people, often respected for their wisdom.',
  prosper: 'To grow and do very well.',
  prospered: 'Grew and did very well.',
  dispute: 'A disagreement or argument between people.',
  councillor: 'A member of a council who helps make decisions.',
  councillors: 'Members of a council who help make decisions.',
  savanna: 'A flat, grassy plain with very few trees.',
  harvest: 'To gather crops once they are ready to eat.',
  invest: 'To use money now so that it can grow later.',
  investing: 'Using money now so that it can grow later.',
  scientist: 'A person who asks questions and studies the world closely.',
  experiment: 'A test carried out to learn something new.',
  gravity: 'The force that pulls objects toward the ground.',
  camouflage: 'Colours or patterns that help an animal hide.',
  chameleon: 'A lizard that can change the colour of its skin.',
  navigate: 'To find and follow a path from one place to another.',
  constellation: 'A group of stars that forms a recognisable pattern.',
  orbit: 'The curved path an object takes around another in space.',
  planet: 'A large, round body that travels around a star.',
  processor: "The part of a computer that does its \"thinking\".",
  artificial: 'Made or produced by people rather than occurring naturally.',
  engineer: 'A person who designs, builds, or repairs machines and structures.',
  resourceful: 'Good at finding quick, clever ways to solve problems.',
  confidence: 'A feeling of trust in your own abilities.',
  invention: 'Something new that has been designed or created.',
  budget: 'A plan for how to spend and save money.',
  memory: 'Something remembered from the past.',
  generation: 'People born and living at around the same time.',
  hawk: 'A bird that hunts small animals for food.',
  gecko: 'A small lizard known for climbing smooth surfaces.',
  ecosystem: 'All the living things in a place, and how they connect.',
  meditation: 'Quiet, focused thinking or reflection.',
};

// Returns up to `limit` distinct glossary matches from `text`, in the order
// they first appear — capped by MAX_VOCABULARY_WORDS_PER_PAGE (rules.js) so
// a dense paragraph doesn't turn into a wall of underlines. Only the first
// occurrence of a repeated word is returned; ReadingText decides how to
// render the rest.
export function pickVocabularyWords(text, limit) {
  if (!text) return [];
  const seen = new Set();
  const matches = [];
  const wordPattern = /[A-Za-zÀ-ÿ']+/g;
  let match;
  while ((match = wordPattern.exec(text)) !== null && matches.length < limit) {
    const raw = match[0];
    const key = raw.toLowerCase();
    if (seen.has(key) || !VOCABULARY[key]) continue;
    seen.add(key);
    matches.push({ word: raw, key, definition: VOCABULARY[key], index: match.index });
  }
  return matches;
}
