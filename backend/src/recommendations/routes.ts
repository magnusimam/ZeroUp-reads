import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { getRecommendations } from "./service";

const recommendations = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

recommendations.use("*", authMiddleware);

recommendations.get("/", async (c) => {
  const authUser = c.get("authUser");
  const books = await getRecommendations(c.env.DB, authUser.sub);
  return c.json({ books });
});

export default recommendations;
