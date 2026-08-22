import { Hono } from "hono";
import type { Env } from "../env";
import { authMiddleware, type AuthVariables } from "../auth/middleware";
import { NOTIFICATIONS_PAGE_SIZE } from "../config/rules";
import { type NotificationRow, toApiNotification } from "./service";

const notifications = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

notifications.use("*", authMiddleware);

notifications.get("/", async (c) => {
  const userId = c.get("authUser").sub;

  const [{ results }, unreadRow] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?")
      .bind(userId, NOTIFICATIONS_PAGE_SIZE)
      .all<NotificationRow>(),
    c.env.DB.prepare("SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = 0")
      .bind(userId)
      .first<{ unreadCount: number }>(),
  ]);

  return c.json({ notifications: results.map(toApiNotification), unreadCount: unreadRow?.unreadCount ?? 0 });
});

// 404s (not 403) for a notification that isn't the caller's own — same
// "don't confirm another user's row exists" posture as the rest of the API.
notifications.patch("/:id/read", async (c) => {
  const userId = c.get("authUser").sub;
  const id = c.req.param("id");

  const existing = await c.env.DB.prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first<NotificationRow>();
  if (!existing) {
    return c.json({ error: "Notification not found." }, 404);
  }

  await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(id).run();
  return c.json({ notification: toApiNotification({ ...existing, is_read: 1 }) });
});

notifications.post("/read-all", async (c) => {
  const userId = c.get("authUser").sub;
  await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0").bind(userId).run();
  return c.json({ success: true });
});

export default notifications;
