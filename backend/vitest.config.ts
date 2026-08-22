import path from "node:path";
import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";

// @cloudflare/vitest-pool-workers v0.22 (vitest v4) dropped
// defineWorkersConfig/the `/config` subpath in favor of a plain vitest
// plugin — cloudflareTest(workersOptions) — added to `plugins`, with the
// old test.poolOptions.workers object becoming its sole argument. Migrated
// by hand following the shape of the package's own bundled
// codemods/vitest-v3-to-v4 (which targets defineWorkersProject, not our
// defineWorkersConfig, but performs the identical transformation).
export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            // Test-only binding so the setup file can apply migrations
            // before each test file runs.
            TEST_MIGRATIONS: migrations,
            // Test-only JWT signing secret — never used outside this test
            // run. Real deploys set JWT_SECRET via `wrangler secret put`;
            // local dev sets it in `.dev.vars` (see .dev.vars.example).
            // Deliberately not in wrangler.jsonc's `vars` at all, since
            // that file is committed and vars aren't for secrets.
            JWT_SECRET: "test-only-secret-not-for-production",
            // Test-only OAuth config — the actual Google endpoints are never
            // called in tests (routes.test.ts stubs global fetch for the
            // token-exchange/userinfo calls); these just need to exist so
            // Env's required fields are satisfied.
            GOOGLE_OAUTH_CLIENT_ID: "test-client-id",
            GOOGLE_OAUTH_CLIENT_SECRET: "test-client-secret",
            OAUTH_REDIRECT_BASE_URL: "http://localhost:8787",
            OAUTH_FRONTEND_REDIRECT_URL: "http://localhost:3000/oauth/callback",
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      // Multi-request flows (register + several sequential API calls against
      // real D1/miniflare) can exceed vitest's 5000ms default on slower
      // machines/CI.
      testTimeout: 20000,
    },
  };
});
