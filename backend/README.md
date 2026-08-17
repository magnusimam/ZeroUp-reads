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
- `GET /books` → optional query params `category`, `language`, `level`, `isEducational` (`true`/`false`), combined with AND → `200 { books: [...] }` (summaries — no page content)
- `GET /books/:id` → `200 { book: { ...summary, content: string[] } }` (full detail, ordered pages) or `404` if the id doesn't exist
- `POST /books` → **Administrator only** (`Authorization: Bearer <token>`) → `{ title, author, language, level, category, content, ageGroup?, description?, isEducational?, attributes? }` → `201 { book }` (`401` no token, `403` wrong role, `400` invalid language/missing field)
- `PATCH /books/:id` → **Administrator only** → any subset of the create fields; `attributes` is merged into the existing bag, not replaced; providing `content` replaces all pages and recomputes `totalPages` → `200 { book }` (`404` unknown id)
- `DELETE /books/:id` → **Administrator only** → `200 { success: true }` (`404` unknown id) — cascades to `book_pages`/`reading_progress`/`bookmarks`/`page_bookmarks`
- `GET /submissions`, `GET /submissions/:id`, `POST /submissions`, `PATCH /submissions/:id`, `POST /submissions/:id/{submit,start-review,request-changes,approve,publish,comments}` — see **Publishing workflow** below.

## Auth

- Passwords are hashed with PBKDF2 (Web Crypto `crypto.subtle`, 100k iterations, per-password random salt) — see `src/auth/password.ts`. No native bcrypt/scrypt in the Workers runtime without a WASM dependency, and this needs zero extra packages.
- Tokens are HS256 JWTs (`hono/jwt`), 7-day expiry, payload `{ sub: userId, role, exp }`.
- `src/auth/middleware.ts` exports `authMiddleware` (verifies the bearer token, attaches `c.get('authUser')`) and `requireRole(...roles)` (composes after it) — the RBAC building block future write endpoints (books admin, publishing) will reuse.
- **Local dev:** copy `.dev.vars.example` to `.dev.vars` (gitignored) and set `JWT_SECRET` to any long random string. Wrangler loads it automatically for `wrangler dev`.
- **Real deploy:** set the real secret with `wrangler secret put JWT_SECRET` — never put it in `wrangler.jsonc`'s `vars` (that file is committed).
- **Tests:** `vitest.config.ts` injects a fixed test-only `JWT_SECRET` via Miniflare bindings, same mechanism as the migrations binding below.
- **Known local quirk:** on this project's pinned `wrangler@3.114.17`, the *very first* `wrangler dev` boot in a session can start before `.dev.vars` finishes loading — `/auth/register` will 500 with `JWT_SECRET` reading as `undefined` even though the startup banner lists it. If you hit this, save any file (or just Ctrl+S `wrangler.jsonc`) to trigger a reload — it resolves immediately and doesn't recur for the rest of that `wrangler dev` session. Worth re-checking once the project upgrades to `wrangler@4` (already flagged as a to-do from Stage 1).

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

## Database (D1)

Schema lives in [`migrations/`](./migrations), applied in order. `wrangler.jsonc`'s `database_id` is currently a **placeholder** (`00000000-...`) — no real remote D1 database exists yet. Local dev and tests don't need it to be real:

```bash
# Apply migrations to the local (simulated) D1 database
npx wrangler d1 migrations apply zeroup-reads-db --local

# Inspect it directly
npx wrangler d1 execute zeroup-reads-db --local --command="SELECT * FROM roles;"
```

Tests apply migrations automatically before each run, via `test/apply-migrations.ts` (`vitest.config.ts` reads `migrations/` with `readD1Migrations` and binds them as `TEST_MIGRATIONS`).

`migrations/0002_seed_books.sql` seeds the 19 books (and their page content) from the frontend's `src/utils/mockData.js` `MOCK_BOOKS` — **generated, not hand-written**: run `node scripts/generate-seed-migration.mjs` to regenerate it whenever `mockData.js`'s books change, rather than hand-editing the SQL (which would drift from the actual source of truth the same way the category/language/level taxonomies once did — see `ENGINEERING_PRINCIPLES_TRACKER.md` Principle 4).

**Before any real deploy:** whoever controls the project's Cloudflare account needs to run `wrangler d1 create zeroup-reads-db` and replace the placeholder `database_id` in `wrangler.jsonc` (both the top-level and `env.staging` blocks) with the real one — the same account-level, deferred-until-owner step already used for the Cloudflare Pages project (see `../wrangler.toml`).

## Stage status

Stage 8 (Publishing workflow) of the backend build. `POST/PATCH/DELETE /books` (Stage 7) intentionally do **not** replicate `booksService.js`'s `translateBook()` — that's an explicit "real Cloudflare API goes here later" stub on the frontend, i.e. Translation Workflow territory (blueprint §10), not admin CRUD. See the plan in the project's engineering tracker for the full stage roadmap: reading progress/bookmarks, translation workflow, search, and beyond.
