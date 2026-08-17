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
    const adminToken = await issueToken("admin-1", ROLES.ADMINISTRATOR, env.JWT_SECRET);
    const res = await scratch.request(
      "/admin-only",
      { headers: { Authorization: `Bearer ${adminToken}` } },
      env
    );
    expect(res.status).toBe(200);
  });
});
