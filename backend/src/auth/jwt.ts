import { sign, verify } from "hono/jwt";
import { JWT_EXPIRY_SECONDS } from "../config/rules";
import type { Role } from "../config/roles";

export interface AuthTokenPayload {
  sub: string; // user id
  role: Role;
  tv: number; // token_version at issue time — see migrations/0015_token_versioning.sql
  exp: number;
  [key: string]: unknown; // required by hono's JWTPayload index signature
}

// tokenVersion defaults to 0 — the DEFAULT every freshly-registered user's
// row actually has, so every existing test/call site that mints a token
// right after registration (without an explicit version) still embeds the
// correct claim.
export async function issueToken(userId: string, role: Role, secret: string, tokenVersion: number = 0): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS;
  return sign({ sub: userId, role, tv: tokenVersion, exp }, secret);
}

export async function verifyToken(token: string, secret: string): Promise<AuthTokenPayload> {
  const payload = await verify(token, secret, "HS256");
  return payload as AuthTokenPayload;
}
