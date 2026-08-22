import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";
import {
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
} from "../config/rules";

async function login(email: string, password: string) {
  return app.request(
    "/auth/login",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) },
    env
  );
}

async function registerFrom(ip: string | null, email: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (ip) headers["CF-Connecting-IP"] = ip;
  return app.request(
    "/auth/register",
    { method: "POST", headers, body: JSON.stringify({ name: "Rate Limit Test", email, password: "correcthorse" }) },
    env
  );
}

describe("login rate limiting", () => {
  it(
    `locks out /auth/login after ${LOGIN_RATE_LIMIT_MAX_ATTEMPTS} failed attempts for the same email`,
    async () => {
      const email = "ratelimit-login@example.com";
      await app.request(
        "/auth/register",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Test", email, password: "correcthorse" }) },
        env
      );

      for (let i = 0; i < LOGIN_RATE_LIMIT_MAX_ATTEMPTS; i += 1) {
        const res = await login(email, "wrong-password");
        expect(res.status).toBe(401);
      }

      // The next attempt — even with the CORRECT password — is blocked, not
      // just another 401, because the failure count is already at threshold
      // before the password is even checked.
      const blocked = await login(email, "correcthorse");
      expect(blocked.status).toBe(429);
    },
    30000
  );

  it("does not lock out a different email after failures on another one", async () => {
    const emailA = "ratelimit-login-a@example.com";
    const emailB = "ratelimit-login-b@example.com";
    await app.request(
      "/auth/register",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "B", email: emailB, password: "correcthorse" }) },
      env
    );

    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX_ATTEMPTS; i += 1) {
      await login(emailA, "wrong-password");
    }

    const res = await login(emailB, "correcthorse");
    expect(res.status).toBe(200);
  });
});

describe("register rate limiting", () => {
  it(
    `locks out /auth/register after ${REGISTER_RATE_LIMIT_MAX_ATTEMPTS} attempts from the same IP`,
    async () => {
      const ip = "203.0.113.42";
      for (let i = 0; i < REGISTER_RATE_LIMIT_MAX_ATTEMPTS; i += 1) {
        const res = await registerFrom(ip, `ratelimit-register-${i}@example.com`);
        expect(res.status).toBe(201);
      }

      const blocked = await registerFrom(ip, "ratelimit-register-overflow@example.com");
      expect(blocked.status).toBe(429);
    },
    30000
  );

  it("is not applied when no CF-Connecting-IP is present (e.g. local dev outside Cloudflare's edge)", async () => {
    for (let i = 0; i < REGISTER_RATE_LIMIT_MAX_ATTEMPTS + 1; i += 1) {
      const res = await registerFrom(null, `ratelimit-register-noip-${i}@example.com`);
      expect(res.status).toBe(201);
    }
  }, 30000);
});
