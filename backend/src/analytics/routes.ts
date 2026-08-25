import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, requirePermission, type AuthVariables } from "../auth/middleware";
import { getAnalyticsSummary } from "./service";

const analytics = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

analytics.use("*", authMiddleware, requirePermission("analytics.view"));

// Matches AnalyticsPage.jsx's role gate exactly (Administrator-only).
analytics.get("/", async (c) => {
  const summary = await getAnalyticsSummary(c.env.DB);
  return c.json(summary);
});

export default analytics;
