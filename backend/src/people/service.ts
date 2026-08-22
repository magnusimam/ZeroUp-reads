// Shared logic behind the Authors and Illustrators domains — identically
// shaped entities (migrations/0009_authors_illustrators.sql), so one
// generic implementation backs both `authors/routes.ts` and
// `illustrators/routes.ts` instead of duplicating the same SQL twice.
// `table` is always one of the two literals below, never user input, so
// interpolating it into a query string carries no injection risk.
export type PersonTable = "authors" | "illustrators";

export type PersonRow = {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export function toApiPerson(row: PersonRow) {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPeople(db: D1Database, table: PersonTable): Promise<PersonRow[]> {
  const { results } = await db.prepare(`SELECT * FROM ${table} ORDER BY name ASC`).all<PersonRow>();
  return results;
}

export async function getPerson(db: D1Database, table: PersonTable, id: string): Promise<PersonRow | null> {
  const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<PersonRow>();
  return row ?? null;
}

export type UpdatePersonInput = { bio?: string | null; photoUrl?: string | null };

// Throws if `id` doesn't exist — callers 404 on the catch, same posture as
// books/routes.ts's PATCH /books/:id.
export async function updatePerson(db: D1Database, table: PersonTable, id: string, patch: UpdatePersonInput): Promise<void> {
  const existing = await getPerson(db, table, id);
  if (!existing) throw new Error("not_found");
  await db
    .prepare(`UPDATE ${table} SET bio = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(patch.bio !== undefined ? patch.bio : existing.bio, patch.photoUrl !== undefined ? patch.photoUrl : existing.photo_url, id)
    .run();
}

// Finds an existing authors/illustrators row by exact name, or creates one —
// called from books/service.ts on book create/update so `books.author_id`
// (and `illustrator_id`, when an illustrator name is supplied) stays linked
// for every new book, not just the ones the Stage-14 migration backfilled.
export async function findOrCreatePerson(db: D1Database, table: PersonTable, name: string): Promise<string> {
  const existing = await db.prepare(`SELECT id FROM ${table} WHERE name = ?`).bind(name).first<{ id: string }>();
  if (existing) return existing.id;

  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO ${table} (id, name) VALUES (?, ?)`).bind(id, name).run();
  return id;
}
