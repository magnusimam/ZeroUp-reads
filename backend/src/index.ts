import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import auth from "./auth/routes";
import books from "./books/routes";
import publishing from "./publishing/routes";
import progress from "./progress/routes";
import bookmarks from "./bookmarks/routes";
import users from "./users/routes";

export type { Env };

const app = new Hono<{ Bindings: Env }>();

// Restricted to the real Cloudflare Pages project now that it exists (see
// backend/README.md) — the production domain, every preview-deployment
// subdomain Pages generates (https://<hash>.zeroup-reads.pages.dev), and
// localhost for local frontend dev against this live backend. Add a custom
// domain here too if/when one is set up.
const ALLOWED_ORIGINS = [
  "https://zeroup-reads.pages.dev",
  "http://localhost:3000",
];
const PAGES_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.zeroup-reads\.pages\.dev$/;

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return undefined;
      if (ALLOWED_ORIGINS.includes(origin) || PAGES_PREVIEW_ORIGIN.test(origin)) return origin;
      return undefined;
    },
  })
);

app.get("/health", (c) =>
  c.json({ status: "ok", environment: c.env.ENVIRONMENT })
);

app.route("/auth", auth);
app.route("/books", books);
app.route("/submissions", publishing);
app.route("/progress", progress);
app.route("/bookmarks", bookmarks);
app.route("/users", users);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
