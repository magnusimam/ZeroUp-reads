import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

function stubGoogleFetch(profile: { id: string; email: string; name: string }) {
  const original = globalThis.fetch;
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      return new Response(JSON.stringify({ access_token: "fake-access-token" }), { status: 200 });
    }
    if (url.startsWith("https://www.googleapis.com/oauth2/v2/userinfo")) {
      return new Response(JSON.stringify(profile), { status: 200 });
    }
    throw new Error(`Unexpected fetch in oauth test: ${url}`);
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

async function getStateFromStart(): Promise<string> {
  const res = await app.request("/auth/oauth/google/start", { redirect: "manual" }, env);
  const location = res.headers.get("Location") as string;
  return new URL(location).searchParams.get("state") as string;
}

describe("GET /auth/oauth/google/start", () => {
  it("redirects to Google's consent screen with a fresh state", async () => {
    const res = await app.request("/auth/oauth/google/start", { redirect: "manual" }, env);
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("Location") as string);
    expect(location.origin + location.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(location.searchParams.get("state")).toBeTruthy();
  });
});

describe("GET /auth/oauth/google/callback", () => {
  let restoreFetch: (() => void) | null = null;
  afterEach(() => {
    restoreFetch?.();
    restoreFetch = null;
  });

  it("400s when code or state is missing", async () => {
    const res = await app.request("/auth/oauth/google/callback?state=x", {}, env);
    expect(res.status).toBe(400);
  });

  it("400s for an unknown/forged state", async () => {
    const res = await app.request("/auth/oauth/google/callback?code=abc&state=never-issued", {}, env);
    expect(res.status).toBe(400);
  });

  it("creates a new user on first sign-in and redirects with a token", async () => {
    const state = await getStateFromStart();
    restoreFetch = stubGoogleFetch({ id: "google-sub-1", email: "new-oauth-user@example.com", name: "New OAuth User" });

    const res = await app.request(`/auth/oauth/google/callback?code=abc&state=${state}`, { redirect: "manual" }, env);
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("Location") as string);
    expect(location.origin + location.pathname).toBe(env.OAUTH_FRONTEND_REDIRECT_URL);
    expect(location.searchParams.get("token")).toBeTruthy();

    const meRes = await app.request("/auth/me", { headers: { Authorization: `Bearer ${location.searchParams.get("token")}` } }, env);
    const me = await json(meRes);
    expect(me.user.email).toBe("new-oauth-user@example.com");
    expect(me.user.oauthProvider).toBe("google");
  });

  it("rejects a replayed state", async () => {
    const state = await getStateFromStart();
    restoreFetch = stubGoogleFetch({ id: "google-sub-2", email: "replay-test@example.com", name: "Replay Test" });

    const first = await app.request(`/auth/oauth/google/callback?code=abc&state=${state}`, { redirect: "manual" }, env);
    expect(first.status).toBe(302);

    const second = await app.request(`/auth/oauth/google/callback?code=abc&state=${state}`, { redirect: "manual" }, env);
    expect(second.status).toBe(400);
  });

  it("links an existing password-based account by email instead of duplicating it", async () => {
    const registerRes = await app.request(
      "/auth/register",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Existing User", email: "existing-user@example.com", password: "correcthorse" }) },
      env
    );
    const { user: existingUser } = await json(registerRes);

    const state = await getStateFromStart();
    restoreFetch = stubGoogleFetch({ id: "google-sub-3", email: "existing-user@example.com", name: "Existing User" });
    const res = await app.request(`/auth/oauth/google/callback?code=abc&state=${state}`, { redirect: "manual" }, env);
    expect(res.status).toBe(302);

    const location = new URL(res.headers.get("Location") as string);
    const meRes = await app.request("/auth/me", { headers: { Authorization: `Bearer ${location.searchParams.get("token")}` } }, env);
    const me = await json(meRes);
    expect(me.user.id).toBe(existingUser.id);
    expect(me.user.oauthProvider).toBe("google");
  });
});
