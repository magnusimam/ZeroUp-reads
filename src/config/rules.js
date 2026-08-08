// Centralized business rules (Rules Engine principle) — named constants that
// business/product could tune without touching component or service code,
// instead of magic numbers buried inline. Not admin-editable yet (post-MVP),
// but living in one place is the prerequisite for that later.

// Used by booksService.createBook() to estimate a book's page count from its
// raw word count.
export const WORDS_PER_PAGE = 300;

// How many books the homepage's "Popular Books" section shows in total
// (sorted by reads, most first): 1 large featured card + the rest as a
// compact list, same "top pick + list" layout as the Library page's
// Educational Books section — used by PopularBooksSection.
export const POPULAR_BOOKS_HIGHLIGHT_COUNT = 4;
