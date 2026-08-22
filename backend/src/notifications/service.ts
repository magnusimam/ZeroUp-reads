export type NotificationRow = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: number;
  created_at: string;
};

export function toApiNotification(row: NotificationRow) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    entityType: row.entity_type,
    entityId: row.entity_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
};

// Called from other domains (publishing/routes.ts's lifecycle transitions)
// to raise a notification — same "shared write helper, not duplicated SQL"
// pattern as books/service.ts's createBookRecord().
export async function createNotification(db: D1Database, input: CreateNotificationInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(input.userId, input.type, input.title, input.message, input.entityType ?? null, input.entityId ?? null)
    .run();
}
