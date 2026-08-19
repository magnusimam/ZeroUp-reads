// Business-rule constants (Rules Engine principle) — named and centralized
// rather than magic numbers buried in route handlers.

export const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const PBKDF2_ITERATIONS = 100_000;
export const MIN_PASSWORD_LENGTH = 8;

// Mirrors the frontend's src/config/rules.js WORDS_PER_PAGE — used to
// estimate a new book's page count from its raw word count on create/update,
// same "each layer keeps its own copy" pattern as config/roles.ts.
export const WORDS_PER_PAGE = 300;

// Mirrors the frontend's READING_MINUTES_PER_PAGE/READING_POINTS_PER_PAGE —
// the reading-progress API needs the same weekly-activity-hours and
// reading-points math the frontend's userService.js used to do in
// localStorage, now computed server-side per Stage 9.
export const READING_MINUTES_PER_PAGE = WORDS_PER_PAGE / 200;
export const READING_POINTS_PER_PAGE = 5;
