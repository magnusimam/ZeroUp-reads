# ZeroUp Reads API

Cloudflare Workers backend for ZeroUp Reads. Built stage-by-stage — see [`../ENGINEERING_PRINCIPLES_TRACKER.md`](../ENGINEERING_PRINCIPLES_TRACKER.md) and [`../docs/ENGINEERING_BLUEPRINT.md`](../docs/ENGINEERING_BLUEPRINT.md).

## Stack

Cloudflare Workers · [Hono](https://hono.dev) · TypeScript · Cloudflare D1 · Vitest (`@cloudflare/vitest-pool-workers`)

## Dev commands

```bash
npm install
npm run dev         # local dev server (wrangler dev)
npm test            # run tests once
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
npm run deploy      # deploy to Cloudflare
```

## Current endpoints

- `GET /health` → `{ status: "ok", environment: "..." }`
- `POST /auth/register` → `{ name, email, password, persona?, orgName? }` → `201 { user, token }` (or `409` if the email's taken, `400` on validation failure)
- `POST /auth/login` → `{ email, password }` → `200 { user, token }` (or `401 { error: "Invalid email or password." }` — same message whether the email doesn't exist or the password is wrong)
- `GET /auth/me` → requires `Authorization: Bearer <token>` → `200 { user }`
- `GET /books` → optional query params `category`, `language`, `level`, `isEducational` (`true`/`false`), `q` (free-text, matched against title/author/description), combined with AND → `200 { books: [...] }` (summaries — no page content)
- `GET /books/:id` → `200 { book: { ...summary, content: string[] } }` (full detail, ordered pages) or `404` if the id doesn't exist
- `POST /books` → **Administrator only** (`Authorization: Bearer <token>`) → `{ title, author, language, level, category, content, ageGroup?, description?, isEducational?, attributes? }` → `201 { book }` (`401` no token, `403` wrong role, `400` invalid language/missing field)
- `PATCH /books/:id` → **Administrator only** → any subset of the create fields; `attributes` is merged into the existing bag, not replaced; providing `content` replaces all pages and recomputes `totalPages` → `200 { book }` (`404` unknown id)
- `DELETE /books/:id` → **Administrator only** → `200 { success: true }` (`404` unknown id) — cascades to `book_pages`/`reading_progress`/`bookmarks`/`page_bookmarks`
- `GET /submissions`, `GET /submissions/:id`, `POST /submissions`, `PATCH /submissions/:id`, `POST /submissions/:id/{submit,start-review,request-changes,approve,publish,comments}` — see **Publishing workflow** below.
- `GET /progress` → requires `Authorization: Bearer <token>` → `200 { stats, inProgress, completedBookIds }` — see **Reading progress & bookmarks** below.
- `PUT /progress/:bookId` → `{ currentPage, totalPages }` → `200 { stats, inProgress, completedBookIds }` (`404` unknown book, `400` invalid body)
- `POST /progress/:bookId/complete` → `200 { stats, inProgress, completedBookIds }` (`404` unknown book) — idempotent
- `GET /bookmarks` → `200 { bookmarks: string[] }` (book ids)
- `POST /bookmarks/:bookId/toggle` → `200 { bookmarked, bookmarks }` (`404` unknown book)
- `GET /bookmarks/:bookId/page` → `200 { pageIndex: number | null }`
- `PUT /bookmarks/:bookId/page` → `{ pageIndex }` → `200 { pageIndex }` (`404` unknown book) — sending the same `pageIndex` again clears it
- `GET /users` → **Administrator only** → `200 { users: [...] }` (password stripped)
- `PATCH /users/:id/role` → **Administrator only** → `{ systemRole }` → `200 { user }` (`404` unknown id, `400` invalid role). The promoted/demoted user's *existing* token still carries the old role until they log in again — roles are a JWT claim, not re-checked against the DB per-request.
- `GET /languages` → public → `200 { languages: [{ code, name }] }`
- `GET /recommendations` → requires `Authorization: Bearer <token>` → `200 { books: [...] }` — see **Recommendations** below.
- `GET /analytics` → **Administrator only** → `200 { totalUsers, totalBooks, booksReadThisWeek, completionsThisWeek, topBooks, byLanguage, byLevel, libraryReads, libraryTitles }` — see **Analytics** below.
- `GET /notifications` → requires auth → `200 { notifications: [...], unreadCount }`
- `PATCH /notifications/:id/read` → requires auth, own notification only → `200 { notification }` (`404` if it isn't the caller's own)
- `POST /notifications/read-all` → requires auth → `200 { success: true }`
- `GET /audit-log` → **Administrator only** → optional `?limit=` (default/max 50) → `200 { entries: [...] }` — see **Audit log** below.
- `GET /auth/oauth/google/start` → `302` to Google's consent screen — see **OAuth (Google)** below.
- `GET /auth/oauth/google/callback` → `302` to the frontend with `?token=...` on success, `400`/`502` on failure.
- `GET /books/:id/versions`, `GET /books/:id/versions/:versionNumber`, `POST /books/:id/versions/:versionNumber/restore` → **Administrator only** — see **Book Versions** below.
- `GET /authors`, `GET /authors/:id` → public; `PATCH /authors/:id` → **Administrator only** (`bio`/`photoUrl` only) — see **Authors & Illustrators** below. `GET /illustrators`, `GET /illustrators/:id`, `PATCH /illustrators/:id` mirror these exactly.
- `GET /ratings/:bookId` → public → `200 { average, count }`; `GET /ratings/:bookId/mine` → requires auth → `200 { rating: number | null }`; `PUT /ratings/:bookId` → `{ rating: 1-5 }` → `200 { average, count }`; `DELETE /ratings/:bookId` → `200 { average, count }` — see **Ratings & Reviews** below.
- `GET /reviews/:bookId` → public → `200 { reviews: [...] }`; `PUT /reviews/:bookId` → `{ reviewText }` → `200 { review }` (upsert); `DELETE /reviews/:bookId` → `200 { success: true }`.
- `GET /collections`, `GET /collections/:id` → public/optional auth; `POST /collections`, `PATCH /collections/:id`, `DELETE /collections/:id`, `POST /collections/:id/books`, `DELETE /collections/:id/books/:bookId` → requires auth, owner or Administrator — see **Collections** below.
- `GET /downloads` → requires auth → `200 { downloads: [...] }`; `POST /downloads/:bookId` → `201 { success: true }` (`404` unknown book) — see **Downloads** below.
- `GET /permissions`, `GET /permissions/roles` → **Administrator only** — see **Permissions** below.

## Auth

- Passwords are hashed with PBKDF2 (Web Crypto `crypto.subtle`, 100k iterations, per-password random salt) — see `src/auth/password.ts`. No native bcrypt/scrypt in the Workers runtime without a WASM dependency, and this needs zero extra packages.
- Tokens are HS256 JWTs (`hono/jwt`), 7-day expiry, payload `{ sub: userId, role, exp }`.
- `src/auth/middleware.ts` exports `authMiddleware` (verifies the bearer token, attaches `c.get('authUser')`) and `requireRole(...roles)` (composes after it) — the RBAC building block future write endpoints (books admin, publishing) will reuse.
- **Local dev:** copy `.dev.vars.example` to `.dev.vars` (gitignored) and set `JWT_SECRET` to any long random string. Wrangler loads it automatically for `wrangler dev`.
- **Real deploy:** set the real secret with `wrangler secret put JWT_SECRET` — never put it in `wrangler.jsonc`'s `vars` (that file is committed).
- **Tests:** `vitest.config.ts` injects a fixed test-only `JWT_SECRET` via Miniflare bindings, same mechanism as the migrations binding below.
- **Known local quirk:** on this project's pinned `wrangler@3.114.17`, the *very first* `wrangler dev` boot in a session can start before `.dev.vars` finishes loading — `/auth/register` will 500 with `JWT_SECRET` reading as `undefined` even though the startup banner lists it. If you hit this, save any file (or just Ctrl+S `wrangler.jsonc`) to trigger a reload — it resolves immediately and doesn't recur for the rest of that `wrangler dev` session. Worth re-checking once the project upgrades to `wrangler@4` (already flagged as a to-do from Stage 1).
- **Rate limiting:** `src/auth/rateLimit.ts` blunts brute-force/mass-signup attempts against `/auth/login` (5 failed attempts per email per 15 minutes → `429`, checked *before* the password comparison) and `/auth/register` (10 attempts per `CF-Connecting-IP` per hour → `429`) — a D1-backed counter (`auth_attempts` table, `migrations/0006_security_hardening.sql`) rather than a Cloudflare Rate Limiting binding, so it needs no extra provisioning/plan. The register limiter is skipped when `CF-Connecting-IP` isn't present (local dev outside Cloudflare's edge, or tests) — real deployed traffic always has that header, so this never opens a gap in production.
- **Audit log:** sensitive admin actions (`PATCH /users/:id/role`, `DELETE /books/:id`, and denied attempts to change the Owner's role) write to `audit_log` — see **Audit log** below.

## OAuth (Google)

Scaffolded but **non-functional as committed** — `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET` in `.dev.vars.example` are placeholders. To make it work:

1. Register a Web application OAuth client at [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Add `<OAUTH_REDIRECT_BASE_URL>/auth/oauth/google/callback` as an authorized redirect URI (e.g. `http://localhost:8787/auth/oauth/google/callback` for local dev).
3. Set the real `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET`/`OAUTH_REDIRECT_BASE_URL`/`OAUTH_FRONTEND_REDIRECT_URL` in `.dev.vars` for local dev; for a real deploy, set `GOOGLE_OAUTH_CLIENT_SECRET` via `wrangler secret put` (never in `wrangler.jsonc`) and the other three as `vars`.

Flow: `GET /auth/oauth/google/start` mints a one-time `state` (`oauth_states` table, `migrations/0007_oauth.sql`, redeemed and deleted on use — a replayed callback URL `400`s) and redirects to Google's consent screen. `GET /auth/oauth/google/callback` exchanges the code, fetches the profile, finds-or-creates a `users` row by email (linking `oauth_provider`/`oauth_subject` onto an existing password-based account if the email already exists, rather than duplicating it), and redirects to `OAUTH_FRONTEND_REDIRECT_URL?token=...`. An OAuth-created account gets a random, never-disclosed `password_hash` (via the same `hashPassword()` as normal registration) so the column stays `NOT NULL` without a schema change — that account can only ever sign in via Google.

**Not built here:** the frontend catch-page at `OAUTH_FRONTEND_REDIRECT_URL` that reads `?token=` off the URL and stores the session — separate frontend-integration work, same pattern as every other domain's frontend wiring.

## Publishing workflow

Mirrors `src/modules/publishing`'s pipeline exactly: `draft → submitted → review → needs_changes → approved → published`. Every route under `/submissions` requires `Authorization: Bearer <token>` **and** one of the publishing roles (Author, Translator, Editor, Publisher, Administrator) — a plain Reader token gets `403` on the whole router.

- `GET /submissions` / `GET /submissions/:id` — list (summaries) / detail (adds `content`, `history`, `comments`). Client-side view filtering ("My Drafts" / "Review Queue" / "Approved") stays on the frontend, same "server returns the full set, view-specific grouping is presentational" pattern as the Books list.
- `POST /submissions` — creates a `draft` owned by the requesting user.
- `PATCH /submissions/:id` — only the submission's author (or an Administrator), and only while `draft`/`needs_changes` (`403`/`409` otherwise).
- `POST /submissions/:id/submit` — `draft`/`needs_changes` → `submitted`. Author/Translator/Administrator, and must be the owner (or admin).
- `POST /submissions/:id/start-review`, `/approve` — `submitted`→`review`→`approved`. Editor/Administrator only.
- `POST /submissions/:id/request-changes` — `review` → `needs_changes`, requires a `comment`. Editor/Administrator only.
- `POST /submissions/:id/publish` — `approved` → `published`. Publisher/Administrator only. **The only step that creates a real, live book** — calls the same `createBookRecord()` (`src/books/service.ts`) that `POST /books` uses, so admin CRUD and the publishing pipeline can never insert a book in two different shapes. Stamps the new book's `attributes.sourceSubmissionId`.
- `POST /submissions/:id/comments` — any publishing-role member, any status.
- Every status transition writes a `submission_history` row (the approval-history timeline) — `by_name` is a snapshot at the time, not a live join, so history reads correctly even if the actor's display name changes later.

All of the above return `409` if the submission isn't in the state the action expects (e.g. approving something still `submitted`, not `review`) — the transition rules are enforced server-side, not just as UI button visibility like `publishingConfig.js`'s `ACTIONS_BY_STATUS`.

## Reading progress & bookmarks

Mirrors the frontend's `userService.js` (per-book position, lifetime/weekly stats, streak) and `bookmarksService.js` (book-level "Save" + page-level pin), now computed server-side against `reading_progress`/`user_stats`/`bookmarks`/`page_bookmarks` (all in the Stage 2 schema) instead of two independent `localStorage` copies.

- `PUT /progress/:bookId` always bumps the reader's streak (no-op if already recorded today, +1 if the last read day was yesterday, reset to 1 otherwise) and adds `READING_MINUTES_PER_PAGE/60` hours to today's `weeklyActivity` bucket — even for a book that's already completed, matching the frontend's own "a page turn always counts as activity" behavior. It only advances `inProgress[bookId]`'s position if that book isn't already marked completed.
- `weekly_activity` is stored at full float precision and rounded to one decimal only when read back out (`toApiStats()`). Rounding on every write (as the original frontend `userService.js` does) discards the sub-0.1 remainder each time, so repeated small per-page increments (~0.025h) can never sum to a visible number — a real bug in the mirrored logic, fixed here rather than carried over.
- `POST /progress/:bookId/complete` is idempotent (a second call for an already-completed book is a no-op) and moves the book out of `inProgress` while bumping `booksCompleted`/`pagesRead`/`booksCompletedThisWeek` — `pagesRead` increments by the book's real `total_pages` from the `books` table, not a client-supplied number.
- A brand-new reader's `user_stats` row starts at zero — unlike the frontend's one-time demo seed off `MOCK_USER`, there's no mock history to seed a real account from.
- Book-level bookmarks (`POST /bookmarks/:bookId/toggle`) and the separate page-level pin (`PUT /bookmarks/:bookId/page`, toggle-off semantics — sending the same `pageIndex` twice clears it) are plain per-user rows, isolated by `user_id`.

## Search

Not a separate domain — `q` is just another `GET /books` query param, AND-combined with `category`/`language`/`level`/`isEducational`. Matches a case-insensitive substring across `title`/`author`/`description` via SQL `LIKE`. A literal `%` or `_` in the search term is escaped before binding (`ESCAPE '\'`), so a reader searching for a literal `%` gets zero matches instead of an unintended wildcard scan of the whole catalogue.

## Recommendations

Rule-based, not ML — no model, no training data. For the signed-in caller, `src/recommendations/service.ts` reads their completed (`reading_progress.completed=1`) and bookmarked books, derives the distinct categories/languages from those, and returns other books in that overlap (excluding anything already completed or in progress), ordered by `rating`. A brand-new reader with no history — or one whose overlap set comes up short — gets topped up with globally top-rated books, the same fallback the frontend onboarding wizard's `RecommendationsStep.jsx` already uses. Always returns exactly `RECOMMENDATIONS_LIMIT` (6) books.

## Analytics

`GET /analytics`'s response shape matches `src/utils/mockData.js`'s `MOCK_STATS` field-for-field, so swapping `statsService.js`/`AnalyticsPage.jsx` onto this endpoint later is a fetch change, not a reshape. Everything is a read-only aggregate over existing tables (`users`, `books`, `user_stats`) — no new schema. `booksReadThisWeek`/`completionsThisWeek` reuse the per-user `books_completed_this_week` counter the Progress domain already maintains (summed across all users) rather than re-deriving "this week"'s date boundary a second time.

## Notifications

A real, persisted feed (`notifications` table, `migrations/0005_notifications.sql`) — not yet wired to `DashboardTopBar.jsx`'s bell, which today just fakes a notification count from the reader's in-progress book count. Currently raised from three points in the Publishing workflow: a submission's author gets one when it's sent back for changes, approved, or published. `PATCH /notifications/:id/read` on a notification that isn't the caller's own returns `404`, not `403` — same "don't confirm another user's row exists" posture as the rest of the API.

## Audit log

Generalizes the Publishing workflow's `submission_history` pattern (actor name/role snapshotted at write-time, not a live join) to any entity via `entity_type`/`entity_id`. Currently written from `PATCH /users/:id/role` (`role_changed`, and `role_change_denied_owner` on the existing Owner-protection 403), and `DELETE /books/:id` (`book_deleted`). Publishing's own lifecycle changes aren't duplicated here — `submission_history` already covers those. `GET /audit-log` is Administrator-only.

## Book Versions

`book_versions` (`migrations/0008_book_versions.sql`) snapshots a book's editable fields and page content immediately before every `PATCH /books/:id`, so an edit is recoverable rather than a silent overwrite — `version_number` is per-book, starting at 1. Restoring an earlier version snapshots the *current* state first, so a restore is itself just another recoverable edit, not a one-way door. `edited_by` is deliberately not a foreign key, same reasoning as `audit_log.actor_id` — a snapshot must never be able to fail (and so block) the edit it's recording.

## Authors & Illustrators

Real entities (`authors`/`illustrators` tables, `migrations/0009_authors_illustrators.sql`), additive alongside the existing `books.author` text column rather than replacing it — every existing route/service that reads/writes `author` keeps working unchanged. `books.author_id`/`illustrator_id` link a book to a full profile (bio, photo) once one exists. `POST`/`PATCH /books` find-or-create the linked row from the `author`/`illustrator` name given (the same idiom the Stage 14 migration used once, as a one-time backfill, now running on every book create/edit too) — renaming happens by editing the book's `author`/`illustrator` field, not by `PATCH`ing the person directly (that endpoint only touches `bio`/`photoUrl`).

## Ratings & Reviews

Two separate tables (`ratings`, `reviews`, `migrations/0011_ratings_reviews.sql`) — a reader can rate a book (a bare 1-5 number) without writing anything, and the two are queried independently. Both are upserts, one row per user per book. `books.rating` (the pre-existing seeded/static number) is untouched by either — nothing recomputes it from `ratings` yet.

## Collections

Curated reading lists (`collections`/`collection_books`, `migrations/0010_collections.sql`), distinct from a reader's own bookmarks: a collection holds several books in order, can be personal or public, and (unlike a bookmark list) is itself a browsable, ownable entity. A private collection a stranger can't see 404s rather than 403ing, same "don't confirm another user's row exists" posture as Notifications.

## Downloads

`downloads` (`migrations/0012_downloads.sql`) logs an offline-download event per `POST /downloads/:bookId` call — one row per event, not deduped, since a re-download after clearing local storage is still a real event worth counting later (e.g. a future "most downloaded" analytics tile).

## Permissions

`permissions`/`role_permissions` (`migrations/0013_permissions.sql`) is a read-only, Administrator-only mirror of exactly what `requireRole(...)` already enforces across `books`/`users`/`publishing`/`analytics`/`audit` routes — a granular breakdown for an admin UI to display "what can an Editor do", not a new enforcement mechanism. `requireRole(...)` itself still checks a hardcoded role list; wiring it to read this table instead is a separate follow-up, not done here.

## Database (D1)

Schema lives in [`migrations/`](./migrations), applied in order. `wrangler.jsonc`'s top-level `database_id` now points at the real D1 database (`zeroup-reads-db`, region WEUR) created under the project's Cloudflare account — the `env.staging` block is still a placeholder pending a separate staging database. Local dev and tests don't need either to be real:

```bash
# Apply migrations to the local (simulated) D1 database
npx wrangler d1 migrations apply zeroup-reads-db --local

# Inspect it directly
npx wrangler d1 execute zeroup-reads-db --local --command="SELECT * FROM roles;"
```

Tests apply migrations automatically before each run, via `test/apply-migrations.ts` (`vitest.config.ts` reads `migrations/` with `readD1Migrations` and binds them as `TEST_MIGRATIONS`).

`migrations/0002_seed_books.sql` seeds the 19 books (and their page content) from the frontend's `src/utils/mockData.js` `MOCK_BOOKS` — **generated, not hand-written**: run `node scripts/generate-seed-migration.mjs` to regenerate it whenever `mockData.js`'s books change, rather than hand-editing the SQL (which would drift from the actual source of truth the same way the category/language/level taxonomies once did — see `ENGINEERING_PRINCIPLES_TRACKER.md` Principle 4).

**Before any real deploy:** the real `zeroup-reads-db` database still needs its schema applied remotely — `wrangler d1 migrations apply zeroup-reads-db --remote` — and a Cloudflare Pages project + `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets set up for the frontend (see `../wrangler.toml`), both still deferred-until-owner account-level steps.

## User & Role Management

There is no self-serve path to becoming an Administrator — every registration (`POST /auth/register`) always creates a `reader`, and `system_role` is otherwise only ever changed by `PATCH /users/:id/role`, which itself requires an existing Administrator's token. The **first** admin on any given database has to be created manually:

```bash
npx wrangler d1 execute zeroup-reads-db --local --command="UPDATE users SET system_role='administrator' WHERE email='you@example.com'"
```

After that, every additional admin is a normal `PATCH /users/:id/role` call from the UI — no more manual DB edits.

## Stage status

Through Stage 14 of the backend build: Auth (4), Books (5-7), Reading progress & bookmarks (9), User & Role Management with Owner protection (10-11), Publishing (8) + admin Book CRUD (12) frontend wiring, Search/Recommendations/Analytics/Notifications/Languages + security hardening (13, backend and frontend both), and BookVersions/Authors/Illustrators/Ratings/Reviews/Collections/Downloads/Permissions (14) are all done. Every domain's frontend service that existed before Stage 13 calls this API by default (`src/config/featureFlags.js`'s `realXApi` flags are all `true`), falling back to the `localStorage` mock only if `REACT_APP_API_BASE_URL` isn't set.

**Stage 14 is backend-only** — every table/endpoint listed above (Book Versions, Authors, Illustrators, Ratings, Reviews, Collections, Downloads, Permissions) exists and is tested, but nothing on the frontend calls any of it yet — same "API exists, frontend swap is a separate stage" gap every prior stage closed for its own domain in turn. OAuth (Google) is additionally gated on registering a real client — see **OAuth (Google)** above.

`POST/PATCH/DELETE /books` (Stage 7) intentionally do **not** replicate `booksService.js`'s `translateBook()` — that's an explicit "real Cloudflare API goes here later" stub on the frontend, i.e. Translation Workflow territory (blueprint §10), deliberately out of scope. Also deliberately out of scope: Audio/TTS, a separate CMS domain (the existing Publishing workflow already **is** what the product docs mean by CMS), and JWT revocation/token-versioning (a real gap — a role change doesn't invalidate an already-issued token until it expires — but a separate feature from what Stage 13 covers).
