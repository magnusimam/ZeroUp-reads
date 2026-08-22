import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { ROLES } from "../config/roles";
import { MIN_PASSWORD_LENGTH } from "../config/rules";
import { hashPassword, verifyPassword } from "./password";
import { issueToken } from "./jwt";
import { authMiddleware, type AuthVariables } from "./middleware";
import { toSafeUser, type UserRow } from "../users/service";

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

const auth = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { name, email, password, persona, orgName } = c.req.valid("json");
  const normalizedEmail = email.toLowerCase();

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first();
  if (existing) {
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

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  const token = await issueToken(id, ROLES.READER, c.env.JWT_SECRET);

  return c.json({ user: toSafeUser(row as UserRow), token }, 201);
});

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const normalizedEmail = email.toLowerCase();

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first<UserRow>();

  // Same generic message either way — never reveal whether the email exists.
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: "Invalid email or password." }, 401);
  }

  const token = await issueToken(row.id, row.system_role as import("../config/roles").Role, c.env.JWT_SECRET);
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

export default auth;
