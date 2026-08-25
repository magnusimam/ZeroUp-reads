import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json();
}

describe("GET /testimonials", () => {
  it("is public — no Authorization header needed", async () => {
    const res = await app.request("/testimonials", {}, env);
    expect(res.status).toBe(200);
  });

  it("lists the seeded testimonials with camelCase bookId", async () => {
    const res = await app.request("/testimonials", {}, env);
    const body = await json(res);
    expect(body.testimonials.length).toBe(3);
    const t1 = body.testimonials.find((t: { id: string }) => t.id === "t1");
    expect(t1.name).toBe("Mrs. Gable");
    expect(t1.bookId).toBe("1");
  });
});
