import { sign, verify } from "hono/jwt";
import { JWT_EXPIRY_SECONDS } from "../config/rules";
import type { Role } from "../config/roles";

export interface AuthTokenPayload {
  sub: string; // user id
  role: Role;
  exp: number;
  [key: string]: unknown; // required by hono's JWTPayload index signature
}

export async function issueToken(userId: string, role: Role, secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS;
  return sign({ sub: userId, role, exp }, secret);
}

export async function verifyToken(token: string, secret: string): Promise<AuthTokenPayload> {
  const payload = await verify(token, secret, "HS256");
  return payload as AuthTokenPayload;
}
