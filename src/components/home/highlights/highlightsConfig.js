import { BOOK_LANGUAGES } from '../../../utils/mockData';

// Same "why we exist" message as the discover row's WhyExistsCard, but this
// card is a distinct illustration-style treatment (screenshot-matched), not
// a reused instance — kept as one exported constant so the copy has a single
// place to edit even though it renders in two visual forms on the page.
export const WHY_EXISTS_COPY = {
  title: 'Why ZeroUp Reads Exists',
  body: "Millions of children across Africa can't read in a language they understand. We are changing that.",
};

// Languages Map card lists real supported languages — pulled from the same
// canonical taxonomy every filter/upload dropdown uses, not a hardcoded list
// that could drift from what the Library page actually supports.
export const MAP_LANGUAGES = BOOK_LANGUAGES;
