# ZeroUp Reads — Scalable Engineering Principles Tracker

Adapted from *Afrizonemart 2.0 — 10 Engineering Principles for Building a Platform That Grows Without Breaking* (Apr 2026, CTO: Magnus), itself drawn from Adia Sowho's "Tomorrow's Growth Starts with Today's Code." Cross-checked against ZeroUp Reads' own source docs in [`docs/`](./docs/) — see [`docs/SCALABLE_ARCHITECTURE_PRINCIPLES.md`](./docs/SCALABLE_ARCHITECTURE_PRINCIPLES.md) (same 10 principles, ZeroUp-Reads-specific framing) and [`docs/ENGINEERING_BLUEPRINT.md`](./docs/ENGINEERING_BLUEPRINT.md) (target domains, data model, workflows) — plus [`docs/ZEROUP_READS_CONCEPT.md`](./docs/ZEROUP_READS_CONCEPT.md) for the product concept these principles serve.

**Why this file exists:** ZeroUp Reads is currently a single-page React app running entirely on mock data and `localStorage`. That's fine for a prototype, but every one of the patterns that broke Afrizonemart's old WordPress site — logic tangled with UI, hardcoded business rules, no module boundaries — used to exist here in miniature too. This file translates the same 10 principles to ZeroUp Reads, audits the codebase against each one, and tracks remediation. As of this pass, **all 10 principles are ✅ Done** — the codebase has a real service layer (one per domain, including bookmarks/testimonials), an event bus with functional subscribers, feature flags, centralized rules and taxonomies, an extensible book schema, domain-organized modules, and no remaining inline business logic in a page's render body — all verified against a production build and repeated live browser smoke tests, including two independent re-audits that each found and fixed genuine (if minor) gaps the prior pass had missed. It remains a living document: every future change should be checked against it (see `CLAUDE.md`), and new gaps should be logged here the same way the old ones were — a "Done" status is a snapshot, not a guarantee against future drift.

**Status legend:** ✅ Done &nbsp;|&nbsp; ⚠️ Partial &nbsp;|&nbsp; ❌ Not started

---

## Summary Table

| # | Principle | One Line | Status |
|---|-----------|----------|--------|
| 1 | API-First Design | Every function is an API | ✅ Done |
| 2 | Feature Flags | Toggle features without code changes | ✅ Done |
| 3 | Rules Engine | Business logic is configurable, not hardcoded | ✅ Done |
| 4 | Schema-Driven Design | Data models adapt without a developer | ✅ Done |
| 5 | Event-Driven Architecture | Systems react to events, not direct calls | ✅ Done |
| 6 | Separation of Concerns | UI, logic, data are separate layers | ✅ Done |
| 7 | Domain-Driven Design | Code speaks the business (reading/library) language | ✅ Done |
| 8 | Infrastructure as Code | Environments defined as version-controlled config | ✅ Done |
| 9 | Modular Architecture | Independent modules, clear boundaries | ✅ Done |
| 10 | Observability by Default | Logging/monitoring built in from day one | ✅ Done |

---

## PRINCIPLE 1 — API-First Design ✅ Done

**What it means here:** Every read/write today's UI does against mock data or `localStorage` — fetching books, logging in, bookmarking, uploading a book, reading analytics — should be behind a function-call boundary shaped like an API, even before a real backend exists. When a real backend arrives, only that one layer changes.

**Audit findings:**
- ~~No API layer exists anywhere. Components import data and mutate it directly.~~ **Fixed:** `booksService.js`, `authService.js`, `statsService.js`, `userService.js`, and `testimonialsService.js` (all `localStorage`-backed, all seeded from `mockData.js`) now exist — one per domain.
- ~~No `statsService.js` — `AnalyticsPage.jsx` still reads `MOCK_STATS` directly, and `HomePage.jsx`/`ProfilePage.jsx` still read `MOCK_BOOKS`/`MOCK_USER` directly.~~ **Fixed:** every page now goes through a service.
- ~~A follow-up re-audit found `LibraryPage.jsx` still importing `MOCK_TESTIMONIALS` directly — missed in the first pass because that audit only grepped for `MOCK_BOOKS`/`MOCK_STATS`/`MOCK_USER`, not `MOCK_TESTIMONIALS`.~~ **Fixed:** `src/modules/library/testimonialsService.js` (`getTestimonials()`) now sits in front of it — read-only, since no create/update/delete exists for testimonials, but still routed through a function boundary rather than imported directly by the page. Re-grepped after the fix: zero `MOCK_*` imports remain anywhere outside the service files themselves.
- No `fetch`/`axios`/real network client yet — expected, since there's no backend to call. The service layer's job right now is to be the seam a real backend slots into later without call sites changing.
- ~~A later re-audit found `components/home/ContinueReadingBanner.jsx` fabricating its data instead of reading it: `const inProgress = [{ ...books[0], currentPage: 5, totalPages: 12 }, { ...books[1], currentPage: 3, totalPages: 10 }]` — every logged-in user saw the exact same two books marked "in progress" with made-up page numbers, regardless of what they'd actually read, even though `userService.js` already existed as the real progress source of truth for this exact concern.~~ **Fixed:** `userService.js` gained `recordProgress(bookId, currentPage, totalPages)`, called from `ReadingPage.jsx` on every page turn (and cleared from the in-progress map by the existing `book.completed` subscriber once a book is finished). `HomePage.jsx` now merges `userService.getProgress().inProgress` with real book records — the same filter/merge pattern `ProfilePage.jsx` already used for bookmarks/completed books — and only renders the banner when a reader has real in-progress books.

**Action items:**
- When a real backend exists, swap each service's `localStorage` implementation for `fetch` calls — call sites (pages/hooks) shouldn't need to change.

---

## PRINCIPLE 2 — Feature Flags ✅ Done

**What it means here:** Ability to turn on/off things like a new reading UI, a translation feature, or an experimental admin tool for a subset of users, without a redeploy.

**Audit findings:**
- ~~No flag system exists. `AdminCMSPage.jsx` ships a "Translate" feature as a hardcoded `setTimeout` stub available to every admin unconditionally — there's no way to gate it, A/B test it, or kill it if the real translation API misbehaves later.~~ **Fixed:** `src/config/featureFlags.js` exports `isFeatureEnabled(flagName)` backed by a plain `FLAGS` object (`bookTranslation: true` today). `src/modules/admin/AdminCMSPage.jsx` gates the Translate button (both mobile and desktop rows) and the translate modal behind `isFeatureEnabled('bookTranslation')` — flipping that one constant to `false` kills the feature app-wide without touching the component.

**Action items:**
- Swap the plain `FLAGS` object for `localStorage`/a config service once flags need to vary per-user or be admin-editable rather than developer-editable.

---

## PRINCIPLE 3 — Rules Engine ✅ Done

**What it means here:** Things like reading-level thresholds, pagination batch sizes, "pages per book" estimation, and reading-streak/goal logic should be configurable data, not numbers buried in JSX.

**Audit findings — hardcoded business rules found directly in components:**
- ~~`LibraryPage.jsx:239-240` — sort rules... hardcoded inline.~~ **Fixed:** the Library page's Sort tab reads `SORT_OPTIONS` and calls `sortBooks()`, both in `src/modules/library/libraryConfig.js`.
- ~~`AdminCMSPage.jsx:62` — `totalPages: Math.ceil(form.content.split(" ").length / 300)` — a business rule ("300 words per page") hardcoded inline in the upload handler.~~ **Fixed:** `WORDS_PER_PAGE = 300` now lives in `src/config/rules.js`, a dedicated home for cross-cutting business rules, imported by `src/modules/books/booksService.js`. Not admin-editable yet (that's the legitimately-deferred post-MVP half of this principle), but it's a single named constant a non-developer could be pointed to, not a number buried in a page component's upload handler.
- ~~`mockData.js` (`MOCK_USER.readingGoal`, `dayStreak`) — goal/streak values are still static mock fields, not computed by any rule.~~ **Fixed (Reader Dashboard):** `dayStreak` is now a real, computed value — `userService.js`'s `recordProgress()` derives it from actual reading activity (consecutive-day check against a persisted `lastReadDate`) instead of staying a frozen mock number. `readingGoal` remains a static seed value (now surfaced/editable nowhere yet) — still open. Achievement badge thresholds for the new Reader Dashboard (`src/modules/dashboard/`) live in `ACHIEVEMENT_RULES` in `src/config/rules.js`, alongside the existing `CONTINUE_JOURNEY_MAX_CARDS`/`RECOMMENDED_BOOKS_COUNT` display-count rules — not hardcoded in `AchievementsSection.jsx`/`useDashboardData.js`.
- `libraryConfig.js` (`STORY_BOOKS_COUNT`, `EDUCATIONAL_SMALL_COUNT`, `LIBRARY_STATS_DISPLAY`) — still the right pattern: named, centralized constants rather than magic numbers/strings in JSX.
- **Reader Dashboard rebuild:** `READING_MINUTES_PER_PAGE` (derived from the existing `WORDS_PER_PAGE` at an assumed 200 wpm reading pace, not a number picked to match a target screenshot), `BOOKS_PER_READER_LEVEL` (reader "Level N" badge), `WEEKDAY_LABELS`, `DASHBOARD_RECENTLY_READ_COUNT`, `DASHBOARD_TOP_GENRES_COUNT` all added to `src/config/rules.js` rather than being buried in the new chart/stat components.
- ~~A later re-audit found the exact category/language taxonomy-drift bug (see Principle 4) recurring for reading levels: `AdminCMSPage.jsx:10` hardcoded its own `LEVELS = ["Beginner", "Intermediate", "Advance"]` (typo — missing the "d") while `useLibraryFilters.js:4` independently hardcoded `LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced']`. Neither read from a shared taxonomy. Concrete failure: an admin uploading a book could only pick "Advance" as the top tier from the dropdown; that book's `level: "Advance"` would then never match any entry in `LEVEL_ORDER`, so no filter chip would ever appear for it on the Library page — it would be permanently unfindable by level filter.~~ **Fixed:** added `BOOK_LEVELS = ['Beginner', 'Intermediate', 'Advanced']` to `mockData.js`; `AdminCMSPage.jsx` and `useLibraryFilters.js` both now alias/import it instead of keeping their own copy.

**Action items:**
- Move `rules.js` constants into an admin-editable table once there's a real admin CMS to edit them from (post-MVP, unchanged from before).

---

## PRINCIPLE 4 — Schema-Driven Design ✅ Done

**What it means here:** Book records should tolerate new fields (category, certification badges, audio narration flag, etc.) without a shape change breaking other pages.

**Audit findings:**
- ~~`mockData.js` books have no `category` field, but `AdminCMSPage.jsx` adds and displays `category` as if it were always present — the schema is already silently diverging between where books are created (admin) and where they're seeded.~~ **Fixed:** every `MOCK_BOOKS` entry carries `category`, `rating`, `ageGroup`, `description`, `isEducational` — all present on every book, no defensive fallbacks needed. `mockData.js` (`BOOK_CATEGORIES`) and `AdminCMSPage.jsx` (`CATEGORIES = BOOK_CATEGORIES`) read the same exported taxonomy.
- ~~There's still no defined "core fields vs. custom attributes" split, so nothing enforces consistency going forward.~~ **Fixed:** every `MOCK_BOOKS` entry and every book created via `booksService.createBook()` now carries an `attributes: {}` bag — a place for future extensible metadata (audio narration, certification, language variants) to live without a core-shape change or a migration of existing books.
- `libraryConfig.js`'s `CATEGORY_CHIPS` is `export const CATEGORY_CHIPS = BOOK_CATEGORIES;` (a re-export, not a copy), so the chip list, the admin category `<select>`, and every book's `category` field can't independently drift.
- ~~A later re-audit found the same risk one step earlier for languages: `AdminCMSPage.jsx` hardcoded its own `LANGUAGES` list (with typos: `"Hause"`, `"igbo"`) instead of reading from a shared taxonomy — the exact pattern that had already caused the `BOOK_CATEGORIES` drift bug once.~~ **Fixed:** added `BOOK_LANGUAGES` to `mockData.js` (typos corrected to `Hausa`/`Igbo`), and `AdminCMSPage.jsx` now aliases `LANGUAGES = BOOK_LANGUAGES`. A separate, unrelated constant in `LibraryHeader.jsx` (a non-functional site-display-language dropdown, not wired to any book data) was renamed `UI_LANGUAGES` with a comment explaining it's a different concept, so the two don't get confused or merged incorrectly later.
- ~~A further re-audit found a live, demonstrable bug of the same root cause: `StoryBooksSection.jsx`'s "Select Theme" dropdown (`STORY_THEMES` in `libraryConfig.js` — 'Animal Stories', 'Fairy Tales', etc.) filtered books by `book.category === theme`, but none of those theme values existed in the actual `category` taxonomy or on any real book. Selecting *any* theme silently emptied the section (verified live: 4 books → 0). `EducationalBooksSection.jsx`'s `EDUCATIONAL_TOPICS` had the same flaw, partially masked — 2 of 5 listed topics (`Science`, `History`) happened to have real matches, but `Technology`/`Mathematics`/`Health` did not.~~ **Fixed:** added a real `theme` field inside each storybook's `attributes` bag (Folktales & Legends, Adventure, Fantasy, Nature & Environment — one per non-educational book), and `StoryBooksSection.jsx` now filters on `book.attributes?.theme` instead of `book.category`. `STORY_THEMES` was trimmed to exactly the 4 themes that have a real book. `EDUCATIONAL_TOPICS` was trimmed to the 3 categories with real educational books (`Science`, `History`, `Language & Culture`). Verified live: selecting "Adventure" now correctly narrows 4 books to 1, instead of to 0.

- See Principle 3 for a fourth recurrence of this same taxonomy-drift pattern, found in a later re-audit: reading levels (`"Advance"` vs `"Advanced"`), fixed the same way with a `BOOK_LEVELS` export.
- **Reader Dashboard's streak fields:** `userService.js`'s persisted progress object gained `streak`/`lastReadDate` (see Principle 3). Readers with a progress record already in `localStorage` from before this change won't have those keys — `bumpStreak()` treats a missing `lastReadDate` as "no prior streak" (starts at 1 on next activity) rather than throwing, so the schema change degrades gracefully instead of requiring a migration.
- **Reader Dashboard rebuild's `weekStart`/`weeklyActivity`/`booksCompletedThisWeek` fields:** same growth pattern — `bumpWeeklyActivity()` treats a missing/stale `weekStart` as "start a fresh Mon-Sun week at zero" rather than throwing, so an existing reader's older progress record upgrades in place on their next page-turn. The one-time demo seed (`SEED_WEEKLY_ACTIVITY`) was deliberately kept under the lifetime `hoursRead` estimate `useDashboardData.js` derives from `pagesRead`, so the dashboard can never show a "this week" number larger than "all time" on a fresh account.

**Action items:**
- Start actually using `attributes` for the next genuinely optional/extensible field that comes up (e.g. an audio-narration flag), rather than adding another top-level core field, to keep the core shape from creeping back open-ended.
- Consider a lint rule or test that fails if a picklist literal (`['Beginner', ...]`-shaped array) appears outside `mockData.js`/`libraryConfig.js`, since this drift bug has now recurred four times (category, language, theme, level) despite each prior fix.

---

## PRINCIPLE 5 — Event-Driven Architecture ✅ Done

**What it means here:** Finishing a book, bookmarking, and admin actions (upload/delete/translate) currently trigger nothing except their own local UI state. Adding a future feature (e.g., award a badge on book completion, notify admin on new upload) means editing the original handler.

**Audit findings:**
- ~~`ReadingPage.jsx:44-51` — `nextPage()` on the last page just does `alert('You finished the book!')`.~~ **Fixed:** `src/utils/eventBus.js` is a minimal `on`/`off`/`emit` pub/sub. `ReadingPage.jsx` emits `book.completed` and shows a toast instead of a blocking `alert()`. `booksService.js` emits `book.uploaded`, `book.deleted`, `translation.completed`; `mockData.js`'s `toggleBookmark` emits `book.bookmarked`; `authService.js` emits `user.registered`, `user.login.success`, `user.login.failed` — matching the event names in `docs/ENGINEERING_BLUEPRINT.md` §13.
- ~~The only current subscriber is `logger.js` — nothing yet reacts functionally.~~ **Fixed:** `src/services/userService.js` subscribes to `book.completed` and persists real reading progress (`booksCompleted`, `pagesRead`, `completedBookIds`) instead of `MOCK_USER` staying a frozen snapshot — verified live in a browser: finishing a book bumped `ProfilePage`'s "Books completed" stat from 7 to 8 without any direct call from `ReadingPage`. `src/modules/analytics/statsService.js` subscribes to `book.uploaded` and `book.completed` to keep the Analytics dashboard's totals live (also verified: uploading a book bumped "Total Books" live).

- **Reader Dashboard addition:** `userService.js` now emits `streak.updated` whenever a reading-streak day rolls over, and `settingsService.js` (new — `src/modules/settings/`) emits `settings.updated` on every preference save. Both are auto-logged the same way every other domain event is (see Principle 10) — no dashboard-specific logging code was needed.

**Action items:**
- Consider a `notificationsService` subscriber on `book.uploaded` for the admin/CMS domain once that's a real feature.

---

## PRINCIPLE 6 — Separation of Concerns ✅ Done

**What it means here:** UI (JSX/Tailwind), business logic (filtering, validation, pagination math, translation), and data (mock/localStorage) should not live in the same function.

**Audit findings:**
- ~~`HomePage.jsx` — 1,154 lines, by far the largest file in the app.~~ **Fixed:** split into 11 presentational components under `src/components/home/` — `HomePage.jsx` itself dropped to 433 lines, a composition of imports rather than a monolith. (Its hero section was later reverted to inline JSX — see action item below.)
- ~~`LibraryPage.jsx` — defines a `FilterPanel` component inside the page file, alongside filter/sort business logic.~~ **Fixed:** rebuilt as a thin composition of `src/modules/library/components/*` sections plus `useLibraryFilters.js`.
- ~~`AdminCMSPage.jsx` — form validation, delete logic, and a translation stub are all inline in the page component.~~ **Fixed:** all of it now lives in `src/modules/admin/useBookUpload.js`.
- ~~`AnalyticsPage.jsx`'s pie-chart geometry math (conic-gradient segment calculation) is computed inline in the page component's render body.~~ **Fixed:** extracted into `src/modules/analytics/pieChart.js` (`computeTotal`, `computePieGradient`) — pure functions, unit-testable without rendering anything. `AnalyticsPage.jsx` just calls them. Verified live: the pie chart still renders with the correct `conic-gradient` background after the extraction.
- ~~A re-audit found `StoryBooksSection.jsx` and `EducationalBooksSection.jsx` independently duplicating near-identical dropdown-filter logic (local open/select state, filter-by-field predicate) — the same behavior implemented twice instead of shared.~~ **Fixed:** extracted into `src/modules/library/useSectionFilter.js` (open/select/filter state), used by both components; each keeps only its own field selector and its own slicing/display composition, which genuinely differ (a plain slice vs. a featured-book + small-list split).

**Action items:**
- `HomePage.jsx`'s hero + `Navbar.jsx` were reverted to a second developer's pixel-matched, inline-styled implementation (per explicit request, to use his committed design verbatim over the app's own extracted `HeroSection`/`HeroNavbar` components, which were deleted as the now-duplicate copy). This reintroduces ~200 lines of inline `style={{}}` JSX into both files — a deliberate, known exception like the Library header/footer one below, not a fresh violation to chase. If this hero/nav is kept long-term, re-extract it into presentational components (headline/CTA/slide data driven, matching the deleted `heroSlides.ts` pattern) the same way the rest of `HomePage.jsx` already is.

---

## PRINCIPLE 7 — Domain-Driven Design ✅ Done

**What it means here:** The codebase's structure should read like "books," "reading," "library," "admin," "auth" — not generic technical buckets.

**Audit findings:**
- ~~Current structure is entirely technical, not domain-based: `pages/`, `components/`, `context/`, `hooks/`, `utils/` — flat CRA defaults. There is no `modules/books`, `modules/auth`, `modules/admin`.~~ **Fixed:** `src/modules/{auth,books,library,reading,admin,analytics}/` now exist, each owning its own pages, services, hooks, and config:
  - `modules/auth/` — `authService.js`, `AuthContext.js`, `LoginPage.jsx`, `RegisterPage.jsx`
  - `modules/books/` — `booksService.js`, `BookCard.jsx`, `BookCoverArt.jsx`
  - `modules/library/` — `LibraryPage.jsx`, `useLibraryFilters.js`, `libraryConfig.js`, `components/*` (the 9 library sections)
  - `modules/reading/` — `ReadingPage.jsx`
  - `modules/admin/` — `AdminCMSPage.jsx`, `useBookUpload.js`
  - `modules/analytics/` — `AnalyticsPage.jsx`, `statsService.js`
  - `modules/dashboard/` (new) — the authenticated-only Reader Dashboard: `DashboardPage.jsx`, `useDashboardData.js` (all data/business logic — Separation of Concerns), `dashboardConfig.js` (category-tile → real taxonomy mapping, per-category accent colours), `achievements.js` (pure `computeAchievements()` + `computeReaderLevel()`), `genreBreakdown.js` (pure `computeGenreBreakdown()`/`computeGenreGradient()` — same extracted-geometry-math pattern as `analytics/pieChart.js`), `components/*` (Sidebar, TopBar, Hero, StatsGrid, ReadingProgressChart, TopGenresChart, RecentlyReadSection, ContinueJourneySection/Card, CategoryExplorer, RecommendedSection, AchievementsSection, DashboardCTA)
  - **Rebuilt to match a pixel reference design** (own sidebar + top bar app shell, replacing the marketing `Navbar`/`Footer` on this one page — a deliberate exception, same pattern/rationale as the Library page's header/footer noted below): added a weekly reading-activity chart, a genre-mix donut, a "Recently Read" list, and a 4-up stats row. Every number on it still traces back to a real persisted metric or a one-time demo seed that then evolves via real events, matching this principle's existing "no fabricated data" bar — see Principle 3 (Rules Engine) and Principle 4 (Schema-Driven Design) below for the specifics.
  - `modules/settings/` (new) — `SettingsPage.jsx` + `settingsService.js` (preferred reading language, default reader font size, and now `readerNightMode` — all genuinely wired into `ReadingPage.jsx`/the dashboard's "New Story" link, not stored-but-unused)
  Moved with a scripted codemod (24 files relocated, imports rewritten across 56 source files) and verified with a clean production build plus a full browser smoke test (register → login → admin upload → library → analytics → reading completion → profile) with zero console errors.
  - **`modules/reading/` rebuilt to match a pixel reference design** (same "own app shell, sidebar-driven" exception as the Dashboard above — `ReaderSidebar.jsx` reuses `DashboardSidebar`'s exported `NAV_ITEMS`/`BookLogoIcon` rather than duplicating the nav list). All new state/logic lives in `useReadingPage.js` (Separation of Concerns), not the page's JSX: `vocabulary.js` (tap-to-define glossary highlighting, `MAX_VOCABULARY_WORDS_PER_PAGE` capped via `rules.js`), `funFacts.js` ("Did you know?" callout — reads `book.attributes.funFacts` first, falls back to a per-category bank, never fabricates per-book claims), `notesService.js` (new localStorage-backed domain service, `note.added`/`note.deleted` added to `logger.js`'s tracked-event list), and a page-level bookmark (`bookmarksService.getPageBookmark`/`setPageBookmark`) kept deliberately separate from the pre-existing book-level "Save". `userService.getReadingPoints()` derives the sidebar's Reading Points stat from the same persisted `pagesRead` counter the Dashboard already reads, instead of a second independently-tracked total. `LANGUAGE_FLAG` (previously local to `BookDetailPage.jsx`) was extracted to `modules/books/languageFlags.js` so the new reading-page `TranslateMenu` doesn't grow its own copy.
- Genuinely cross-cutting pieces were deliberately *not* forced into a domain folder: `Navbar`/`Footer`/`ErrorBoundary` (app shell), `ToastContext` (used everywhere), `eventBus`/`logger`/`mockData` (infrastructure, not one domain's), `featureFlags`/`rules` (config, cross-domain), `userService`/`ProfilePage` (the blueprint's separate "Users" domain — not one of the six modules built out yet). This matches the principle's intent — module boundaries, not "everything must be nested somewhere."
- ~~Duplication as a symptom: `BookCard` was defined twice.~~ Fixed (unchanged from prior pass) — now lives once at `modules/books/BookCard.jsx`.
- ~~A later re-audit found bookmark logic (`getBookmarks`/`toggleBookmark`/`isBookmarked`) living in the generic `utils/mockData.js` rather than a domain module — function-boundary-wrapped already, but organizationally misplaced.~~ **Fixed:** moved to `src/modules/reading/bookmarksService.js`. `ReadingPage.jsx` and `ProfilePage.jsx` updated to import from there.

**Action items:**
- Longer-term, the blueprint (`docs/ENGINEERING_BLUEPRINT.md` §5) names a fuller domain list — Languages, Translation, Audio, Search, Recommendations, Users, CMS, AI, Notifications — add modules for these as those features actually get built, rather than pre-creating empty folders now.

**Production-ready feature build (this pass):** four of those deferred domains got built out for real, each following the existing one-service-per-domain shape:
- `modules/onboarding/` — first-run wizard (languages/age-group/interests/reading-level → personalized recommendations), triggered from `RegisterPage.jsx` on fresh signup only.
- `modules/help/` — Help Center (FAQ + Contact/Report a Problem/Suggest a Book/Feedback, one shared `SupportForm` parameterized by type).
- `modules/publishing/` — the blueprint's §8 Publishing Workflow (`draft → submitted → review → needs_changes → approved → published`), with role-gated actions and an approval-history timeline.
- `modules/translation/` — the blueprint's §10 Translation Workflow (`Original → Human Review → Approval → Publish`) as a real side-by-side workspace with autosave, replacing the reader-request flow's old instant-stub approval with a genuine human-in-the-loop step (the pre-existing `books/translationRequestService.js` now feeds *into* this workspace instead of being the whole pipeline).

Also new: `src/config/roles.js` (RBAC — Reader/Translator/Author/Editor/Publisher/Administrator, separate from the pre-existing signup "persona" field) and `src/components/RequireRole.jsx` (route guard), used to gate all four of the above plus a new `/admin/users` User & Role Management page. `modules/reading/offlineService.js` (+ `useOnlineStatus`/`syncService`) adds a `localStorage`-backed offline-download story (Download/Downloading/Offline Available/Remove states, `/downloads`), matching this file's existing "mock now, swap the implementation later" posture rather than a real Cache API/service-worker implementation (a deliberate scope choice, not an oversight).

---

## PRINCIPLE 8 — Infrastructure as Code ✅ Done

**What it means here:** Deployment target, environment variables, and build config should be version-controlled, not set up by hand.

**Audit findings:**
- ~~No `.env.example` or CI config anywhere in the repo.~~ **Fixed:** `.env.example` documents the config the app will need once the service layer talks to a real backend. `.github/workflows/build.yml` runs `npm ci && npm run build` on every push/PR to `main`.
- ~~A re-audit found `.env.example`'s comment still referenced the pre-reorg path `src/services/*` for the whole service layer.~~ **Fixed:** updated to `src/modules/<domain>/*Service.js, src/services/*.js`, matching where things actually live post-reorg. Same stale-path wording was also found and fixed in `CLAUDE.md`'s Principle 4 bullet (it additionally had a stray zero-width space character baked into the path from a prior edit).
- **Correction to a prior finding:** the `build/` directory exists on disk (CRA output) but is *not* actually committed — already in `.gitignore`, zero tracked files. The earlier claim that it was committed was stale/incorrect.
- **Corrected hosting target:** this was initially built out assuming Vercel (a `vercel.json` was committed) — that was wrong. The actual target is **Cloudflare, for both frontend and backend**. Fixed: `vercel.json` deleted; `wrangler.toml` commits the Cloudflare Pages project config (`pages_build_output_dir = "build"`); `public/_redirects` (`/* /index.html 200`) handles SPA client-side routing the way Cloudflare Pages expects (Vercel's rewrite syntax doesn't apply there); `.github/workflows/build.yml` gained a `cloudflare/wrangler-action` deploy step, gated on `secrets.CLOUDFLARE_API_TOKEN` being set so it's skipped (not a failure) until those secrets actually exist. `.env.example` was also corrected to **not** define `REACT_APP_CLOUDFLARE_API_TOKEN`/`REACT_APP_CLOUDFLARE_ACCOUNT_ID` — a `REACT_APP_*` var ships inside the client bundle, so a Cloudflare API token there would leak publicly; those credentials belong in CI/Workers-project secrets, never in a client env var.
- Still open: actually connecting the Cloudflare Pages project (and, later, a separate Workers backend project) is an account-level action outside version control by nature — the config being committed just means that connection step doesn't also require hand-configuring build settings.
- ~~A later re-audit found the committed `build.yml` was actually failing: `npm run build` (`react-scripts build`) treats ESLint warnings as build-breaking errors whenever `CI=true`, which GitHub Actions runners set automatically — but this had only ever been verified with a plain local `npm run build` (`CI` unset), which just warns. Three pre-existing warnings (`Navbar.jsx`'s unused `ZRLogo` function, `ToastContext.js`'s missing `removeToast` dep in `useCallback`, `AdminCMSPage.jsx`'s unused `Footer` import) meant every push/PR build on `main` was red.~~ **Fixed:** removed the dead `ZRLogo` component and the unused `Footer` import, and added `removeToast` to `addToast`'s dependency array (reordering the two `useCallback`s so `removeToast` is defined first). Re-verified with `CI=true npm run build` locally (matching what the GitHub Actions runner actually does) — compiles clean.

**Action items:**
- Wire real secrets into GitHub Actions (`secrets.*`) once `.env.example`'s values are actually consumed by the service layer.

---

## PRINCIPLE 9 — Modular Architecture ✅ Done

**What it means here:** Auth, books, admin, and analytics should be independent modules that don't reach into each other's internals.

**Audit findings:**
- ~~`AuthContext.js` implements its own bespoke `login`/`logout` against `localStorage`, while a *separate* module `utils/auth.js` implements `registerUser`/`loginUser` against a *different* `localStorage` key — two parallel, disconnected auth implementations.~~ **Fixed:** collapsed into `src/modules/auth/authService.js`; `utils/auth.js` and the stray empty `src/auth/` folder were deleted. This also fixed a real bug the divergence had caused: `LoginPage.jsx` was discarding the real registered user record and logging every successful login back in as a hardcoded `{ role: "reader", name: email-prefix }` — a Teacher/Creator/etc. account lost its role and real name on every login. It now uses the actual returned user (verified live: registered as Teacher, logged back in, role stayed `Teacher`).
- ~~`AdminCMSPage.jsx` holds its own copy of the book catalogue in local state, completely disconnected from what `LibraryPage.jsx` renders — an admin upload never appears in the public library.~~ **Fixed:** both read/write through `src/modules/books/booksService.js`. `ReadingPage.jsx` also reads through it so an admin-uploaded book is actually openable, not just listed. Verified live in a browser: upload in Admin → same book appears in Library → same book opens and completes in Reading.
- ~~No `src/modules/{books,reading,library,admin,auth,analytics}/` folder boundaries yet.~~ **Fixed:** see Principle 7 — the physical reorg landed in the same pass as this principle's functional fixes, so the module boundary is now both logical (one service per domain) and physical (one folder per domain).
- **Reader Dashboard reuse check:** the new `modules/dashboard/` deliberately reads through existing single sources of truth instead of growing its own copies — `useContinueReading` (reading module), `booksService`/`userService` (unchanged), and `BookCoverArt` (books module) for the dashboard's illustrated cards/category tiles. The one new shared piece it needed, avatar-initial colour picking, was previously inlined only in `Navbar.jsx`'s `AvatarDropdown` — extracted to `src/utils/avatarColor.js` and both components now import it, rather than the dashboard sidebar growing a second copy.

**Note on the Library redesign's header/footer:** `LibraryPage.jsx` renders `modules/library/components/LibraryHeader.jsx`/`LibraryFooter.jsx` instead of the app-wide `Navbar.jsx`/`Footer.jsx`. Deliberate exception, not a duplicate-component regression: the brief called for different nav items and a dark/gold treatment only this page uses. If that aesthetic becomes site-wide, fold these back into the shared components with a `variant` prop (same pattern `BookCard` uses) rather than keeping two navs long-term.

---

## PRINCIPLE 10 — Observability by Default ✅ Done

**What it means here:** Know when a login fails, a book upload errors, or a page throws — without a user having to report it manually.

**Audit findings:**
- ~~No logging library, no `ErrorBoundary` anywhere in the app.~~ **Fixed:** `src/utils/logger.js` writes structured `{ level, message, data, timestamp }` entries and auto-subscribes to every event on `eventBus.js` — `user.registered`, `user.login.success/failed`, `book.uploaded`, `book.deleted`, `translation.completed`, `book.completed`, `book.bookmarked` are all logged automatically, with no call site needing to remember to log them. `src/components/ErrorBoundary.jsx` wraps the whole app in `App.js` — a component crash shows a recoverable screen and logs via `logError` instead of silently blanking the page.
- ~~The only "signal" is a blocking `alert()`.~~ **Fixed:** replaced with an emitted `book.completed` event plus a toast.
- ~~`AnalyticsPage.jsx` renders static `MOCK_STATS`, disconnected from the events now being emitted.~~ **Fixed:** `statsService.js` subscribes to `book.uploaded`/`book.completed` and updates persisted counts live — verified in a browser: uploading a book bumped the Analytics "Total Books" tile from 138 to 139 without a page-specific code change.
- Still open: no real error-tracking service (`Sentry`) — everything logs to the browser console only. Correctly deferred: there's no backend/real user base yet for a tracking service to be useful against, and adding the dependency now would be premature.

**Action items:**
- When a backend exists, wire `winston` + `@sentry/react` per the source doc's tooling recommendation, replacing `logger.js`'s console calls with real sinks.

---

## Priority Roadmap — status

The original roadmap (Immediate / Week 1 / Week 2 / Post-MVP) is fully cleared: all 10 principles are ✅ Done. What's left is deliberately deferred, not overlooked:

| Item | Principle | Why it's still open |
|---|---|---|
| `testimonialsService.js` should swap to a real API call | API-First Design | `booksService.js`, `authService.js` (including user/role management), `userService.js` (reading progress), `bookmarksService.js`, `publishingService.js`, `statsService.js` (Stage 13), `languagesService.js` (Stage 13), `recommendationsService.js` (Stage 13), and `notificationsService.js` (Stage 13) now all call the real `backend/` API behind `realXApi` feature flags. Only `testimonialsService.js` still has no backend endpoint at all. |
| Admin-editable rules table, per-cohort feature flags | Rules Engine, Feature Flags | Explicitly post-MVP — only pay off with a real admin CMS and a real audience. |
| Real error tracking (`Sentry`) | Observability by Default | `backend/src/utils/logger.ts` now emits structured `{level, message, data, timestamp}` events (unhandled errors, rate-limit blocks, denied Owner-role-change attempts) captured by Cloudflare Workers Logs — a real step up from nothing, but still not an external tracking dashboard with alerting/search like Sentry. Still deferred: no real user base yet to justify the added dependency. |
| Cloudflare Pages project + `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets actually set up | Infrastructure as Code | Account-level action, outside version control by nature. |
| Modules for Translation, Audio, CMS, AI | Domain-Driven Design | Add as those features get built — not worth pre-creating empty folders. Languages (`src/modules/books/languagesService.js`), Recommendations (`src/modules/library/recommendationsService.js`), Search (folded into `booksService.js`'s existing `GET /books` query params, not a separate module), and Notifications (`src/modules/notifications/`) are now real, Stage 13. |
| Wire `LibraryHeader.jsx`'s `UI_LANGUAGES` dropdown to real i18n | (not yet a tracked principle violation) | Currently a non-functional placeholder — no `onChange`/state. Fine as-is until site localization is an actual feature. |

---

## How to use this file

- Update the status table and audit findings as work lands — this is a living document, not a one-time report.
- Every new PR/feature should be checked against the relevant principle(s) before merging.
- See `CLAUDE.md` for how this is enforced as a default working rule for this repo.
