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

## Auth

- Passwords are hashed with PBKDF2 (Web Crypto `crypto.subtle`, 100k iterations, per-password random salt) — see `src/auth/password.ts`. No native bcrypt/scrypt in the Workers runtime without a WASM dependency, and this needs zero extra packages.
- Tokens are HS256 JWTs (`hono/jwt`), 7-day expiry, payload `{ sub: userId, role, exp }`.
- `src/auth/middleware.ts` exports `authMiddleware` (verifies the bearer token, attaches `c.get('authUser')`) and `requireRole(...roles)` (composes after it) — the RBAC building block future write endpoints (books admin, publishing) will reuse.
- **Local dev:** copy `.dev.vars.example` to `.dev.vars` (gitignored) and set `JWT_SECRET` to any long random string. Wrangler loads it automatically for `wrangler dev`.
- **Real deploy:** set the real secret with `wrangler secret put JWT_SECRET` — never put it in `wrangler.jsonc`'s `vars` (that file is committed).
- **Tests:** `vitest.config.ts` injects a fixed test-only `JWT_SECRET` via Miniflare bindings, same mechanism as the migrations binding below.
- **Known local quirk:** on this project's pinned `wrangler@3.114.17`, the *very first* `wrangler dev` boot in a session can start before `.dev.vars` finishes loading — `/auth/register` will 500 with `JWT_SECRET` reading as `undefined` even though the startup banner lists it. If you hit this, save any file (or just Ctrl+S `wrangler.jsonc`) to trigger a reload — it resolves immediately and doesn't recur for the rest of that `wrangler dev` session. Worth re-checking once the project upgrades to `wrangler@4` (already flagged as a to-do from Stage 1).

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

Stage 7 (Books API — write) of the backend build. Publishing workflow (draft → submitted → review → needs_changes → approved → published submissions, matching `src/modules/publishing`) was split out as its own next stage rather than bundled here — it's a materially bigger feature with its own table/lifecycle, not a natural fit for one PR alongside admin CRUD. `POST/PATCH/DELETE /books` intentionally do **not** replicate `booksService.js`'s `translateBook()` — that's an explicit "real Cloudflare API goes here later" stub on the frontend, i.e. Translation Workflow territory (blueprint §10), not admin CRUD. See the plan in the project's engineering tracker for the full stage roadmap.
