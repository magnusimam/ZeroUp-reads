import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { authMiddleware, requireRole, type AuthVariables } from "../auth/middleware";
import { ROLES } from "../config/roles";
import { AUDIT_LOG_PAGE_SIZE } from "../config/rules";
import { type AuditLogRow, toApiAuditLogEntry } from "./service";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(AUDIT_LOG_PAGE_SIZE).optional(),
});

const audit = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

audit.use("*", authMiddleware, requireRole(ROLES.ADMINISTRATOR));

audit.get("/", zValidator("query", querySchema), async (c) => {
  const { limit } = c.req.valid("query");
  const { results } = await c.env.DB.prepare("SELECT * FROM audit_log ORDER BY at DESC, id DESC LIMIT ?")
    .bind(limit ?? AUDIT_LOG_PAGE_SIZE)
    .all<AuditLogRow>();
  return c.json({ entries: results.map(toApiAuditLogEntry) });
});

export default audit;
