// Business-rule constants (Rules Engine principle) — named and centralized
// rather than magic numbers buried in route handlers.

export const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const PBKDF2_ITERATIONS = 100_000;
export const MIN_PASSWORD_LENGTH = 8;
