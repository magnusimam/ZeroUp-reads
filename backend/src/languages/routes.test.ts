import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

describe("GET /languages", () => {
  it("is public — no Authorization header needed", async () => {
    const res = await app.request("/languages", {}, env);
    expect(res.status).toBe(200);
  });

  it("lists the seeded languages, alphabetically by name", async () => {
    const res = await app.request("/languages", {}, env);
    const body = await json(res);
    expect(body.languages.length).toBeGreaterThan(0);
    expect(body.languages.some((l: { code: string }) => l.code === "English")).toBe(true);
    const names = body.languages.map((l: { name: string }) => l.name);
    expect(names).toEqual([...names].sort());
  });
});
