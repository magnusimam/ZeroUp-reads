import { Hono } from "hono";
import type { Env } from "../env";
import { OAUTH_STATE_TTL_MINUTES } from "../config/rules";
import { ROLES, type Role } from "../config/roles";
import { hashPassword } from "./password";
import { issueToken } from "./jwt";
import { type UserRow } from "../users/service";

// Scaffold only — GOOGLE_OAUTH_CLIENT_ID/SECRET are placeholders until a
// real Google Cloud OAuth client is registered (see backend/README.md's
// OAuth section and .dev.vars.example). Same deferred-until-owner posture
// already used for JWT_SECRET and the D1 database.
const google = new Hono<{ Bindings: Env }>();

google.get("/start", async (c) => {
  const state = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO oauth_states (state) VALUES (?)").bind(state).run();

  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE_URL}/auth/oauth/google/callback`;
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
});

google.get("/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) {
    return c.json({ error: "Missing code or state." }, 400);
  }

  // Delete-on-read: whether or not it turns out to be fresh, a given state
  // can never be redeemed twice — a replayed callback URL 400s instead of
  // silently signing someone in a second time.
  const stored = await c.env.DB.prepare("SELECT created_at FROM oauth_states WHERE state = ?")
    .bind(state)
    .first<{ created_at: string }>();
  if (stored) {
    await c.env.DB.prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
  }
  const isFresh =
    stored !== null &&
    Date.now() - new Date(`${stored.created_at.replace(" ", "T")}Z`).getTime() <= OAUTH_STATE_TTL_MINUTES * 60_000;
  if (!isFresh) {
    return c.json({ error: "Invalid or expired OAuth state." }, 400);
  }

  const redirectUri = `${c.env.OAUTH_REDIRECT_BASE_URL}/auth/oauth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: c.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return c.json({ error: "Could not exchange the authorization code with Google." }, 502);
  }
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    return c.json({ error: "Could not fetch the Google profile." }, 502);
  }
  const profile = (await profileRes.json()) as { id: string; email: string; name: string };
  const normalizedEmail = profile.email.toLowerCase();

  let row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(normalizedEmail).first<UserRow>();
  if (!row) {
    const id = crypto.randomUUID();
    // Random, never-disclosed password hash — this account can only ever
    // sign in via Google, but password_hash stays NOT NULL-satisfied
    // without a schema change (see migrations/0007_oauth.sql).
    const unusablePasswordHash = await hashPassword(`${crypto.randomUUID()}${crypto.randomUUID()}`);
    await c.env.DB.prepare(
      `INSERT INTO users (id, name, email, password_hash, system_role, oauth_provider, oauth_subject)
       VALUES (?, ?, ?, ?, ?, 'google', ?)`
    )
      .bind(id, profile.name, normalizedEmail, unusablePasswordHash, ROLES.READER, profile.id)
      .run();
    row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  } else if (!row.oauth_provider) {
    // An existing password-based account signing in with Google for the
    // first time — link it rather than creating a duplicate user.
    await c.env.DB.prepare("UPDATE users SET oauth_provider = 'google', oauth_subject = ? WHERE id = ?")
      .bind(profile.id, row.id)
      .run();
  }

  const user = row as UserRow;
  const token = await issueToken(user.id, user.system_role as Role, c.env.JWT_SECRET);
  return c.redirect(`${c.env.OAUTH_FRONTEND_REDIRECT_URL}?token=${encodeURIComponent(token)}`, 302);
});

export default google;
