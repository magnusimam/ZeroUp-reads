import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { ROLES } from "../config/roles";
import { MIN_PASSWORD_LENGTH, PASSWORD_RESET_TOKEN_TTL_MINUTES } from "../config/rules";
import { hashPassword, verifyPassword } from "./password";
import { issueToken } from "./jwt";
import { authMiddleware, type AuthVariables } from "./middleware";
import { toSafeUser, type UserRow } from "../users/service";
import { clientIp, isLoginRateLimited, isRegisterRateLimited, recordAuthAttempt } from "./rateLimit";
import google from "./oauthGoogle";
import { logEvent } from "../utils/logger";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
  persona: z.string().trim().optional(),
  orgName: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const requestResetSchema = z.object({
  email: z.string().trim().email(),
});

const completeResetSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
});

const auth = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { name, email, password, persona, orgName } = c.req.valid("json");
  const normalizedEmail = email.toLowerCase();
  const ip = clientIp(c);

  if (await isRegisterRateLimited(c.env.DB, ip)) {
    logEvent("warn", "Register rate limit exceeded", { ip });
    return c.json({ error: "Too many registration attempts from this network. Please try again later." }, 429);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first();
  if (existing) {
    await recordAuthAttempt(c.env.DB, "register", normalizedEmail, ip, false);
    return c.json({ error: "This email is already registered." }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    `INSERT INTO users (id, name, email, password_hash, persona, org_name, system_role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, name, normalizedEmail, passwordHash, persona ?? null, orgName ?? null, ROLES.READER)
    .run();
  await recordAuthAttempt(c.env.DB, "register", normalizedEmail, ip, true);

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  const token = await issueToken(id, ROLES.READER, c.env.JWT_SECRET, (row as UserRow).token_version);

  return c.json({ user: toSafeUser(row as UserRow), token }, 201);
});

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const normalizedEmail = email.toLowerCase();
  const ip = clientIp(c);

  // Checked before the password is even compared — a locked-out attacker's
  // next guess never reaches verifyPassword().
  if (await isLoginRateLimited(c.env.DB, normalizedEmail)) {
    logEvent("warn", "Login rate limit exceeded", { email: normalizedEmail, ip });
    return c.json({ error: "Too many failed attempts. Please try again later." }, 429);
  }

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first<UserRow>();

  // Same generic message either way — never reveal whether the email exists.
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    await recordAuthAttempt(c.env.DB, "login", normalizedEmail, ip, false);
    return c.json({ error: "Invalid email or password." }, 401);
  }
  await recordAuthAttempt(c.env.DB, "login", normalizedEmail, ip, true);

  const token = await issueToken(row.id, row.system_role as import("../config/roles").Role, c.env.JWT_SECRET, row.token_version);
  return c.json({ user: toSafeUser(row), token });
});

auth.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(authUser.sub)
    .first<UserRow>();

  if (!row) {
    return c.json({ error: "User not found." }, 404);
  }

  return c.json({ user: toSafeUser(row) });
});

// Real backend for the frontend mock's requestPasswordReset() (see
// src/modules/auth/authService.js) — same one-live-token-per-user shape and
// same anti-enumeration posture as /auth/login (a generic 200 regardless of
// whether the email exists). The token is returned in the response ONLY
// because no real email-sending backend exists yet — see backend/README.md's
// Password reset section. Once one does, this stops returning it and the
// frontend's CheckEmailPage demo-link shortcut (which reads it off this
// response) disappears on its own.
auth.post("/password-reset/request", zValidator("json", requestResetSchema), async (c) => {
  const { email } = c.req.valid("json");
  const normalizedEmail = email.toLowerCase();

  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first<{ id: string }>();
  if (!user) {
    return c.json({ success: true });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000).toISOString();
  await c.env.DB.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(user.id).run();
  await c.env.DB.prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, user.id, expiresAt)
    .run();

  return c.json({ success: true, token });
});

auth.get("/password-reset/:token", async (c) => {
  const token = c.req.param("token");
  const row = await c.env.DB.prepare(
    `SELECT u.email as email, pr.expires_at as expires_at
     FROM password_resets pr JOIN users u ON u.id = pr.user_id
     WHERE pr.token = ?`
  )
    .bind(token)
    .first<{ email: string; expires_at: string }>();

  if (!row) {
    return c.json({ valid: false, reason: "This link is invalid." });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return c.json({ valid: false, reason: "This link has expired." });
  }
  return c.json({ valid: true, email: row.email });
});

auth.post("/password-reset/:token", zValidator("json", completeResetSchema), async (c) => {
  const token = c.req.param("token");
  const { password } = c.req.valid("json");

  const reset = await c.env.DB.prepare("SELECT user_id, expires_at FROM password_resets WHERE token = ?")
    .bind(token)
    .first<{ user_id: string; expires_at: string }>();
  if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
    return c.json({ success: false, message: "This link is invalid or has expired." }, 400);
  }

  const passwordHash = await hashPassword(password);
  // Bumping token_version revokes every session already signed in on this
  // account (migrations/0015_token_versioning.sql) — the right posture for a
  // password reset, same as a role change.
  await c.env.DB.prepare("UPDATE users SET password_hash = ?, token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(passwordHash, reset.user_id)
    .run();
  await c.env.DB.prepare("DELETE FROM password_resets WHERE token = ?").bind(token).run();

  return c.json({ success: true });
});

auth.route("/oauth/google", google);

export default auth;
