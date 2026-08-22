-- A real, persisted notification feed — replaces DashboardTopBar.jsx's
-- current stand-in (it just shows a count of in-progress books as a fake
-- "bell"). See ENGINEERING_PRINCIPLES_TRACKER.md's forward-looking note
-- tying a future Notifications domain to server-side lifecycle events.
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
