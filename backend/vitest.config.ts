import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      poolOptions: {
        workers: {
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
            },
          },
        },
      },
    },
  };
});
