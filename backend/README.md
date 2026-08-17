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

## Auth

- Passwords are hashed with PBKDF2 (Web Crypto `crypto.subtle`, 100k iterations, per-password random salt) — see `src/auth/password.ts`. No native bcrypt/scrypt in the Workers runtime without a WASM dependency, and this needs zero extra packages.
- Tokens are HS256 JWTs (`hono/jwt`), 7-day expiry, payload `{ sub: userId, role, exp }`.
- `src/auth/middleware.ts` exports `authMiddleware` (verifies the bearer token, attaches `c.get('authUser')`) and `requireRole(...roles)` (composes after it) — the RBAC building block future write endpoints (books admin, publishing) will reuse.
- **Local dev:** copy `.dev.vars.example` to `.dev.vars` (gitignored) and set `JWT_SECRET` to any long random string. Wrangler loads it automatically for `wrangler dev`.
- **Real deploy:** set the real secret with `wrangler secret put JWT_SECRET` — never put it in `wrangler.jsonc`'s `vars` (that file is committed).
- **Tests:** `vitest.config.ts` injects a fixed test-only `JWT_SECRET` via Miniflare bindings, same mechanism as the migrations binding below.

## Database (D1)

Schema lives in [`migrations/`](./migrations), applied in order. `wrangler.jsonc`'s `database_id` is currently a **placeholder** (`00000000-...`) — no real remote D1 database exists yet. Local dev and tests don't need it to be real:

```bash
# Apply migrations to the local (simulated) D1 database
npx wrangler d1 migrations apply zeroup-reads-db --local

# Inspect it directly
npx wrangler d1 execute zeroup-reads-db --local --command="SELECT * FROM roles;"
```

Tests apply migrations automatically before each run, via `test/apply-migrations.ts` (`vitest.config.ts` reads `migrations/` with `readD1Migrations` and binds them as `TEST_MIGRATIONS`).

**Before any real deploy:** whoever controls the project's Cloudflare account needs to run `wrangler d1 create zeroup-reads-db` and replace the placeholder `database_id` in `wrangler.jsonc` (both the top-level and `env.staging` blocks) with the real one — the same account-level, deferred-until-owner step already used for the Cloudflare Pages project (see `../wrangler.toml`).

## Stage status

Stage 3 (Auth API) of the backend build. See the plan in the project's engineering tracker for the full stage roadmap: books API, publishing workflow, reading progress, and beyond.
