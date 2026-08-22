export type CollectionRow = {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  is_public: number;
  created_at: string;
  updated_at: string;
};

export function toApiCollection(row: CollectionRow) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    isPublic: Boolean(row.is_public),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Visible to `viewerId`: every public collection, plus (if signed in) the
// viewer's own private ones — a guest only ever sees the public set.
export async function listVisibleCollections(db: D1Database, viewerId: string | null): Promise<CollectionRow[]> {
  const { results } = await db
    .prepare(
      viewerId
        ? "SELECT * FROM collections WHERE is_public = 1 OR owner_id = ? ORDER BY created_at DESC"
        : "SELECT * FROM collections WHERE is_public = 1 ORDER BY created_at DESC"
    )
    .bind(...(viewerId ? [viewerId] : []))
    .all<CollectionRow>();
  return results;
}

export async function getCollection(db: D1Database, id: string): Promise<CollectionRow | null> {
  const row = await db.prepare("SELECT * FROM collections WHERE id = ?").bind(id).first<CollectionRow>();
  return row ?? null;
}

// A private collection is only visible to its owner or an Administrator —
// same "don't confirm another user's row exists" posture as notifications'
// PATCH /notifications/:id/read (callers 404 rather than 403 on the caller's
// side, so this just says yes/no).
export function canView(collection: CollectionRow, viewerId: string | null, isAdmin: boolean): boolean {
  return Boolean(collection.is_public) || collection.owner_id === viewerId || isAdmin;
}

export function canManage(collection: CollectionRow, userId: string, isAdmin: boolean): boolean {
  return collection.owner_id === userId || isAdmin;
}

export type CreateCollectionInput = { ownerId: string; name: string; description?: string | null; isPublic?: boolean };

export async function createCollection(db: D1Database, input: CreateCollectionInput): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO collections (id, owner_id, name, description, is_public) VALUES (?, ?, ?, ?, ?)")
    .bind(id, input.ownerId, input.name, input.description ?? null, input.isPublic ? 1 : 0)
    .run();
  return id;
}

export type UpdateCollectionInput = { name?: string; description?: string | null; isPublic?: boolean };

export async function updateCollection(db: D1Database, id: string, existing: CollectionRow, patch: UpdateCollectionInput): Promise<void> {
  await db
    .prepare(
      "UPDATE collections SET name = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(
      patch.name ?? existing.name,
      patch.description !== undefined ? patch.description : existing.description,
      (patch.isPublic ?? Boolean(existing.is_public)) ? 1 : 0,
      id
    )
    .run();
}

export async function deleteCollection(db: D1Database, id: string): Promise<void> {
  await db.prepare("DELETE FROM collections WHERE id = ?").bind(id).run();
}

export async function getCollectionBooks(db: D1Database, collectionId: string) {
  const { results } = await db
    .prepare(
      `SELECT books.* FROM collection_books
       JOIN books ON books.id = collection_books.book_id
       WHERE collection_books.collection_id = ?
       ORDER BY collection_books.position ASC`
    )
    .bind(collectionId)
    .all();
  return results;
}

export async function addBookToCollection(db: D1Database, collectionId: string, bookId: string): Promise<void> {
  const nextPositionRow = await db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 as next FROM collection_books WHERE collection_id = ?")
    .bind(collectionId)
    .first<{ next: number }>();
  await db
    .prepare(
      `INSERT INTO collection_books (collection_id, book_id, position) VALUES (?, ?, ?)
       ON CONFLICT (collection_id, book_id) DO NOTHING`
    )
    .bind(collectionId, bookId, nextPositionRow?.next ?? 0)
    .run();
}

export async function removeBookFromCollection(db: D1Database, collectionId: string, bookId: string): Promise<void> {
  await db
    .prepare("DELETE FROM collection_books WHERE collection_id = ? AND book_id = ?")
    .bind(collectionId, bookId)
    .run();
}
