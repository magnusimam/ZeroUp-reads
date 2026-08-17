import { Hono } from "hono";
import type { Env } from "./env";
import auth from "./auth/routes";

export type { Env };

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) =>
  c.json({ status: "ok", environment: c.env.ENVIRONMENT })
);

app.route("/auth", auth);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
