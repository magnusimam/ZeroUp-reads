export type LogLevel = "debug" | "info" | "warn" | "error";

// Mirrors the frontend's src/utils/logger.js structured shape
// ({level, message, data, timestamp}) for consistency across the stack.
// wrangler.jsonc's observability.enabled already turns on Cloudflare Workers
// Logs, which captures console output automatically — no external
// Sentry/DSN dependency needed to get structured, queryable error events.
export function logEvent(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const line = JSON.stringify({ level, message, data: data ?? null, timestamp: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
