import type { Context } from "hono";
import {
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_MINUTES,
  REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
  REGISTER_RATE_LIMIT_WINDOW_MINUTES,
} from "../config/rules";

// Cloudflare-set — not spoofable past the edge (unlike X-Forwarded-For,
// which a client could set itself).
export function clientIp(c: Context): string {
  return c.req.header("CF-Connecting-IP") ?? "unknown";
}

async function countRecentAttempts(
  db: D1Database,
  kind: "login" | "register",
  column: "email" | "ip",
  value: string,
  windowMinutes: number,
  onlyFailures: boolean
): Promise<number> {
  const failureClause = onlyFailures ? "AND success = 0" : "";
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count FROM auth_attempts
       WHERE kind = ? AND ${column} = ? ${failureClause} AND at >= datetime('now', ?)`
    )
    .bind(kind, value, `-${windowMinutes} minutes`)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function recordAuthAttempt(
  db: D1Database,
  kind: "login" | "register",
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  await db
    .prepare("INSERT INTO auth_attempts (kind, email, ip, success) VALUES (?, ?, ?, ?)")
    .bind(kind, email, ip, success ? 1 : 0)
    .run();
}

// Checked before the password comparison, on every /auth/login call — a
// locked-out attacker gets 429 without another guess being processed.
// Counts only failures, so a reader who mistypes their own password a few
// times and then gets it right isn't punished on their next real login.
export async function isLoginRateLimited(db: D1Database, email: string): Promise<boolean> {
  const failures = await countRecentAttempts(db, "login", "email", email, LOGIN_RATE_LIMIT_WINDOW_MINUTES, true);
  return failures >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
}

// Counts every attempt (not just failures) — the goal is blunting automated
// mass account creation from one IP, not just repeated retries against one
// already-taken email. Skipped when clientIp() couldn't find a real
// CF-Connecting-IP (local dev without going through Cloudflare's edge, or
// tests) — real deployed traffic always has one, so this never opens a gap
// in production, it just avoids bucketing every unidentified caller together
// under one fake "unknown" IP.
export async function isRegisterRateLimited(db: D1Database, ip: string): Promise<boolean> {
  if (ip === "unknown") return false;
  const attempts = await countRecentAttempts(db, "register", "ip", ip, REGISTER_RATE_LIMIT_WINDOW_MINUTES, false);
  return attempts >= REGISTER_RATE_LIMIT_MAX_ATTEMPTS;
}
