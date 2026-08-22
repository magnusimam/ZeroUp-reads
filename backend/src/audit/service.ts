export type AuditLogRow = {
  id: number;
  actor_id: string | null;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: string | null;
  at: string;
};

export function toApiAuditLogEntry(row: AuditLogRow) {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    at: row.at,
  };
}

export type WriteAuditLogInput = {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

// Generalizes the submission_history pattern (publishing/routes.ts) to any
// entity — called from other domains' sensitive mutations (role changes,
// book deletes) rather than duplicated per call site.
export async function writeAuditLog(db: D1Database, input: WriteAuditLogInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_log (actor_id, actor_name, actor_role, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.actorId,
      input.actorName,
      input.actorRole,
      input.action,
      input.entityType,
      input.entityId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null
    )
    .run();
}
