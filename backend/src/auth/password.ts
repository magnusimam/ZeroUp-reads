import { PBKDF2_ITERATIONS } from "../config/rules";

// PBKDF2 via Web Crypto (crypto.subtle) — no native bcrypt/scrypt available
// in the Workers runtime without a WASM dependency, and this needs zero
// extra packages. Stored format: "pbkdf2$<iterations>$<saltB64>$<hashB64>"
// so the iteration count can be bumped later without invalidating existing
// hashes (older ones just keep verifying against their stored count).

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

// Constant-time comparison — avoids leaking hash-match progress through
// timing, which a naive `===`/loop-with-early-return would do.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const [, iterationsStr, saltB64, hashB64] = parts;
  const iterations = Number(iterationsStr);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  const salt = fromBase64(saltB64);
  const expected = fromBase64(hashB64);
  const actual = await deriveBits(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}
