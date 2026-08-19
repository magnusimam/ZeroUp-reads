// Minimal feature-flag system (Feature Flags principle): a named, centralized
// place to toggle a feature for a user without a code change/redeploy, instead
// of a feature just always being on for everyone the moment it ships.
// Backed by a plain object for now; swap the object for a config service call
// once flags need to be admin-editable or per-cohort.
const FLAGS = {
  bookTranslation: true,
  // AI-narrated reading (docs/ZEROUP_READS_CONCEPT.md §5.1's TTS pipeline)
  // isn't built yet (no audio/AI-voice service exists) — BookDetailPage's
  // "Read with AI" button reads this to show a friendly "coming soon" state
  // instead of a dead click, and flips on in one place once it ships.
  bookAIReading: false,
  // Production-ready feature build (see ENGINEERING_PRINCIPLES_TRACKER.md) —
  // each is a real, shipped feature today; kept as flags (not bare code) so
  // any one can be killed instantly without a redeploy if it misbehaves.
  roleManagement: true,
  publishingPipeline: true,
  translationPortal: true,
  offlineReading: true,
  // Stage 4 of the backend build (see ENGINEERING_PRINCIPLES_TRACKER.md
  // Principle 1): routes authService's register/login/session calls to the
  // real Cloudflare Workers API (backend/) instead of localStorage, when a
  // REACT_APP_API_BASE_URL is also configured (see .env.example). Default
  // false so this only turns on deliberately, and can be flipped back off
  // instantly — no redeploy — if the real API misbehaves.
  realAuthApi: false,
  // Stage 6 of the backend build: hydrates booksService's localStorage
  // catalogue from the real backend/ Books API once at app boot (see
  // src/index.js's bootstrap()) instead of every getBooks()/getBook() call
  // site being reworked into async/loading-state code — see
  // backend/README.md and ENGINEERING_PRINCIPLES_TRACKER.md Principle 1.
  // Same default-false, instantly-reversible posture as realAuthApi.
  realBooksApi: false,
  // Stage 9 of the backend build: routes userService's reading-progress
  // reads/writes and bookmarksService's book-/page-level bookmarks to the
  // real backend/ Progress + Bookmarks APIs — hydrated once per session
  // (app boot / login, see AuthContext.js) into the same localStorage cache
  // every existing synchronous call site already reads, with writes
  // best-effort mirrored to the API in the background. Same default-false,
  // instantly-reversible posture as realAuthApi/realBooksApi.
  realProgressApi: false,
  realBookmarksApi: false,
};

export function isFeatureEnabled(flagName) {
  return Boolean(FLAGS[flagName]);
}
