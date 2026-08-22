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

// Mirrors the frontend onboarding wizard's RECOMMENDATIONS_COUNT — how many
// books GET /recommendations returns.
export const RECOMMENDATIONS_LIMIT = 6;

// How many books GET /analytics's topBooks list includes.
export const ANALYTICS_TOP_BOOKS_LIMIT = 5;

// Page size for GET /notifications and GET /audit-log — neither existed
// before this stage, so there's no prior frontend constant to mirror; picked
// to comfortably cover a session's worth of activity without an unbounded
// query.
export const NOTIFICATIONS_PAGE_SIZE = 50;
export const AUDIT_LOG_PAGE_SIZE = 50;

// Brute-force protection for /auth/login (by email) and /auth/register (by
// IP, since no account exists yet to key on) — see auth/rateLimit.ts.
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 15;
export const REGISTER_RATE_LIMIT_MAX_ATTEMPTS = 10;
export const REGISTER_RATE_LIMIT_WINDOW_MINUTES = 60;

// How long an OAuth `state` value stays redeemable (auth/oauthGoogle.ts) —
// long enough for a real consent-screen round trip, short enough to keep a
// leaked/guessed state's window of usefulness small.
export const OAUTH_STATE_TTL_MINUTES = 10;

// Bounds for POST /ratings/:bookId's body — a star rating, not a free number.
export const MIN_RATING = 1;
export const MAX_RATING = 5;
