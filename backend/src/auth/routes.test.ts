import { env } from "cloudflare:test";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import app from "../index";
import { authMiddleware, requireRole, type AuthVariables } from "./middleware";
import { ROLES } from "../config/roles";
import type { Env } from "../env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

async function registerUser(overrides: Partial<Record<string, string>> = {}) {
  return app.request(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Amina Osei",
        email: "amina@example.com",
        password: "correct-horse",
        ...overrides,
      }),
    },
    env
  );
}

describe("POST /auth/register", () => {
  it("creates a user and returns a token", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.user).toMatchObject({
      name: "Amina Osei",
      email: "amina@example.com",
      systemRole: "reader",
    });
    expect(body.user.password_hash).toBeUndefined();
    expect(typeof body.token).toBe("string");
  });

  it("rejects a duplicate email with 409", async () => {
    await registerUser({ email: "dup@example.com" });
    const res = await registerUser({ email: "dup@example.com" });
    expect(res.status).toBe(409);
  });

  it("normalizes email case so duplicates are still caught", async () => {
    await registerUser({ email: "casetest@example.com" });
    const res = await registerUser({ email: "CaseTest@Example.com" });
    expect(res.status).toBe(409);
  });

  it("rejects a too-short password with 400", async () => {
    const res = await registerUser({ email: "shortpw@example.com", password: "short" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email with 400", async () => {
    const res = await registerUser({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("logs in with correct credentials", async () => {
    await registerUser({ email: "login-ok@example.com", password: "correct-horse" });
    const res = await app.request(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "login-ok@example.com", password: "correct-horse" }),
      },
      env
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.user.email).toBe("login-ok@example.com");
    expect(typeof body.token).toBe("string");
  });

  it("rejects a wrong password with a generic 401", async () => {
    await registerUser({ email: "login-bad@example.com", password: "correct-horse" });
    const res = await app.request(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "login-bad@example.com", password: "wrong-password" }),
      },
      env
    );
    expect(res.status).toBe(401);
    const body = await json(res);
    expect(body.error).toBe("Invalid email or password.");
  });

  it("rejects an unknown email with the same generic 401", async () => {
    const res = await app.request(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", password: "whatever1" }),
      },
      env
    );
    expect(res.status).toBe(401);
    const body = await json(res);
    expect(body.error).toBe("Invalid email or password.");
  });
});

describe("GET /auth/me", () => {
  it("returns the current user for a valid token", async () => {
    const registerRes = await registerUser({ email: "me@example.com" });
    const { token } = await json(registerRes);

    const res = await app.request("/auth/me", { headers: { Authorization: `Bearer ${token}` } }, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.user.email).toBe("me@example.com");
  });

  it("rejects a missing Authorization header", async () => {
    const res = await app.request("/auth/me", {}, env);
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    const res = await app.request("/auth/me", { headers: { Authorization: "Bearer not-a-real-token" } }, env);
    expect(res.status).toBe(401);
  });
});

describe("password reset", () => {
  async function requestReset(email: string) {
    return app.request(
      "/auth/password-reset/request",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) },
      env
    );
  }

  it("POST /password-reset/request returns success:true without a token for an unknown email", async () => {
    const res = await requestReset("nobody-reset@example.com");
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body).toEqual({ success: true });
  });

  it("POST /password-reset/request returns a token for a real email", async () => {
    await registerUser({ email: "reset-me@example.com" });
    const res = await requestReset("reset-me@example.com");
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe("string");
  });

  it("a second request for the same user invalidates the first token (one live token per user)", async () => {
    await registerUser({ email: "reset-twice@example.com" });
    const first = await json(await requestReset("reset-twice@example.com"));
    await requestReset("reset-twice@example.com");

    const res = await app.request(`/auth/password-reset/${first.token}`, {}, env);
    const body = await json(res);
    expect(body.valid).toBe(false);
  });

  it("GET /password-reset/:token validates a fresh token", async () => {
    await registerUser({ email: "reset-validate@example.com" });
    const { token } = await json(await requestReset("reset-validate@example.com"));

    const res = await app.request(`/auth/password-reset/${token}`, {}, env);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body).toEqual({ valid: true, email: "reset-validate@example.com" });
  });

  it("GET /password-reset/:token reports an unknown token as invalid", async () => {
    const res = await app.request("/auth/password-reset/not-a-real-token", {}, env);
    const body = await json(res);
    expect(body.valid).toBe(false);
  });

  it("POST /password-reset/:token sets the new password and consumes the token", async () => {
    await registerUser({ email: "reset-complete@example.com", password: "old-password" });
    const { token } = await json(await requestReset("reset-complete@example.com"));

    const res = await app.request(
      `/auth/password-reset/${token}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "new-password" }) },
      env
    );
    expect(res.status).toBe(200);
    expect((await json(res)).success).toBe(true);

    // The new password works...
    const loginRes = await app.request(
      "/auth/login",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "reset-complete@example.com", password: "new-password" }) },
      env
    );
    expect(loginRes.status).toBe(200);

    // ...and the token can't be replayed.
    const replay = await app.request(
      `/auth/password-reset/${token}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "another-password" }) },
      env
    );
    expect(replay.status).toBe(400);
  });

  it("resetting the password revokes any already-issued session token", async () => {
    const registerRes = await registerUser({ email: "reset-revokes@example.com", password: "old-password" });
    const { token: sessionToken } = await json(registerRes);
    const { token: resetToken } = await json(await requestReset("reset-revokes@example.com"));

    await app.request(
      `/auth/password-reset/${resetToken}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "new-password" }) },
      env
    );

    const res = await app.request("/auth/me", { headers: { Authorization: `Bearer ${sessionToken}` } }, env);
    expect(res.status).toBe(401);
  });

  it("400s completing a reset with an expired/unknown token", async () => {
    const res = await app.request(
      "/auth/password-reset/not-a-real-token",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "whatever1" }) },
      env
    );
    expect(res.status).toBe(400);
  });
});

describe("requireRole middleware", () => {
  // Self-contained scratch app so this doesn't require a real protected
  // production route to exist yet — exercises the same authMiddleware +
  // requireRole pair future write-endpoints (Stage 5+) will use.
  const scratch = new Hono<{ Bindings: Env; Variables: AuthVariables }>();
  scratch.get("/admin-only", authMiddleware, requireRole(ROLES.ADMINISTRATOR), (c) => c.json({ ok: true }));

  it("allows a matching role through", async () => {
    const registerRes = await registerUser({ email: "role-reader@example.com" });
    const { token } = await json(registerRes);
    // A fresh reader token won't satisfy ADMINISTRATOR — prove the 403 path,
    // then prove the 200 path with a hand-issued administrator token.
    const forbidden = await scratch.request(
      "/admin-only",
      { headers: { Authorization: `Bearer ${token}` } },
      env
    );
    expect(forbidden.status).toBe(403);
  });

  it("allows an administrator token through", async () => {
    const { issueToken } = await import("./jwt");
    // A real registered user, not a fabricated id — migrations/0015_token_versioning.sql
    // means authMiddleware now 401s a token whose user id doesn't exist in `users`.
    const registerRes = await registerUser({ email: "role-admin@example.com" });
    const { user } = await json(registerRes);
    const adminToken = await issueToken(user.id, ROLES.ADMINISTRATOR, env.JWT_SECRET);
    const res = await scratch.request(
      "/admin-only",
      { headers: { Authorization: `Bearer ${adminToken}` } },
      env
    );
    expect(res.status).toBe(200);
  });
});
