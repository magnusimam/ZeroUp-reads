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

Stage 2 (D1 schema + migrations) of the backend build. See the plan in the project's engineering tracker for the full stage roadmap: auth, books API, publishing workflow, reading progress, and beyond.
