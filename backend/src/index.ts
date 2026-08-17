import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import auth from "./auth/routes";
import books from "./books/routes";

export type { Env };

const app = new Hono<{ Bindings: Env }>();

// Open CORS for now — this API only issues/verifies bearer tokens (no
// cookies), so there's no CSRF exposure from allowing any origin. Restrict
// to the real frontend origin(s) (Cloudflare Pages URL + custom domain)
// once those are known, the same "tighten once the real value exists"
// pattern already used for wrangler.jsonc's placeholder D1 database_id.
app.use("*", cors());

app.get("/health", (c) =>
  c.json({ status: "ok", environment: c.env.ENVIRONMENT })
);

app.route("/auth", auth);
app.route("/books", books);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
