import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "./index";

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await app.request("/health", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok", environment: "production" });
  });
});

describe("unknown route", () => {
  it("returns 404 json", async () => {
    const res = await app.request("/nope", {}, env);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "Not Found" });
  });
});
