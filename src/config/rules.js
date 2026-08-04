// Centralized business rules (Rules Engine principle) — named constants that
// business/product could tune without touching component or service code,
// instead of magic numbers buried inline. Not admin-editable yet (post-MVP),
// but living in one place is the prerequisite for that later.

// Used by booksService.createBook() to estimate a book's page count from its
// raw word count.
export const WORDS_PER_PAGE = 300;
