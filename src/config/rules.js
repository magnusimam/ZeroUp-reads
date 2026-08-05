// Centralized business rules (Rules Engine principle) — named constants that
// business/product could tune without touching component or service code,
// instead of magic numbers buried inline. Not admin-editable yet (post-MVP),
// but living in one place is the prerequisite for that later.

// Used by booksService.createBook() to estimate a book's page count from its
// raw word count.
export const WORDS_PER_PAGE = 300;

// Used by the homepage hero slider (HeroSection) to advance slides automatically.
export const HERO_SLIDER_AUTOPLAY_MS = 6000;

// How many books the homepage's "Popular Books" highlight card shows at once
// (a mini preview strip, not the full library carousel) — used by
// PopularBooksHighlightCard.
export const POPULAR_BOOKS_HIGHLIGHT_COUNT = 4;
