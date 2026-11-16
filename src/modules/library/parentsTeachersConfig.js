// Rules for the Parents & Teachers page (/parents-teachers): which books land
// on which shelf. Books are picked automatically from fields they already
// have (category, level, age group), so the page is never empty and needs no
// admin work. Adjust a shelf by editing its `categories` / `levels` here.

// Books per Parents shelf.
export const PARENT_SHELF_SIZE = 6;

export const AUDIENCE_TABS = [
  { id: 'parents', label: 'For Parents', icon: '👪' },
  { id: 'teachers', label: 'For Teachers', icon: '🍎' },
];

// Omitted keys mean "any".
export const PARENT_SHELVES = [
  {
    id: 'first-readers',
    title: 'First readers',
    subtitle: 'Easy, picture-rich stories for children just starting out (ages 3–6).',
    levels: ['Beginner'],
    ageGroups: ['Children'],
  },
  {
    id: 'values-culture',
    title: 'Stories with values & culture',
    subtitle: 'Folktales, history and everyday life that spark talks about kindness, courage and who we are.',
    categories: ['Storybooks', 'Culture', 'Language & Culture', 'History'],
  },
  {
    id: 'learn-together',
    title: 'Learn something new together',
    subtitle: 'Science, health and technology stories for curious kids — great for asking "why?" together.',
    categories: ['Science', 'Technology', 'AI', 'Health', 'Space', 'Environment', 'Animals'],
    levels: ['Beginner', 'Intermediate'],
  },
];

export const PARENT_TIPS = [
  'Read together for 15 minutes a day — little and often beats long and rare.',
  'Pause and ask "What do you think happens next?"',
  'Read the same story in your home language with Translate a Story.',
];

// Teacher "subject" filters, each grouping one or more book categories.
// Subjects with no books yet are hidden automatically.
export const TEACHER_SUBJECTS = [
  { id: 'science', label: 'Science', categories: ['Science', 'Space', 'Environment', 'Animals'] },
  { id: 'tech', label: 'Technology & AI', categories: ['Technology', 'AI'] },
  { id: 'health', label: 'Health', categories: ['Health'] },
  { id: 'maths', label: 'Maths & Money', categories: ['Mathematics', 'Finance'] },
  { id: 'history', label: 'History & Culture', categories: ['History', 'Culture', 'Language & Culture'] },
  { id: 'agriculture', label: 'Agriculture', categories: ['Agriculture'] },
  { id: 'stories', label: 'Storytelling', categories: ['Storybooks', 'Adventure', 'Arts'] },
];

export const TEACHER_TIPS = [
  'Match a book to your class with the reading-level filter.',
  'Use Translate a Story to read the same book in your pupils\' home language.',
  'Each card shows what the book teaches — use it as your lesson hook.',
];

export function matchesShelf(book, shelf) {
  return (!shelf.categories || shelf.categories.includes(book.category))
    && (!shelf.levels || shelf.levels.includes(book.level))
    && (!shelf.ageGroups || shelf.ageGroups.includes(book.ageGroup));
}
