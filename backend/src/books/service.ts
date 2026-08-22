import { WORDS_PER_PAGE } from "../config/rules";
import { findOrCreatePerson } from "../people/service";

export type BookRow = {
  id: string;
  title: string;
  author: string;
  language: string;
  level: string;
  total_pages: number;
  category: string;
  age_group: string | null;
  rating: number;
  reads: number;
  description: string | null;
  is_educational: number;
  attributes: string;
  author_id: string | null;
  illustrator_id: string | null;
  created_at: string;
  updated_at: string;
};

// Maps the DB row (snake_case, attributes as a JSON string) to the shape the
// frontend's mock data already uses (camelCase, attributes as a real
// object) — same "one boundary, no reshaping at the call site" seam as
// auth/routes.ts's toSafeUser.
export function toApiBook(row: BookRow) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    language: row.language,
    level: row.level,
    totalPages: row.total_pages,
    category: row.category,
    ageGroup: row.age_group,
    rating: row.rating,
    reads: row.reads,
    description: row.description,
    isEducational: Boolean(row.is_educational),
    attributes: JSON.parse(row.attributes),
    authorId: row.author_id,
    illustratorId: row.illustrator_id,
  };
}

export function toContentArray(content: string | string[]): string[] {
  return Array.isArray(content) ? content : [content];
}

export function estimatePages(pages: string[]): number {
  const wordCount = pages.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
}

export async function getPageContent(db: D1Database, bookId: string): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT content FROM book_pages WHERE book_id = ? ORDER BY page_number ASC")
    .bind(bookId)
    .all<{ content: string }>();
  return results.map((row) => row.content);
}

export async function replacePages(db: D1Database, bookId: string, pages: string[]): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM book_pages WHERE book_id = ?").bind(bookId),
    ...pages.map((content, index) =>
      db
        .prepare("INSERT INTO book_pages (book_id, page_number, content) VALUES (?, ?, ?)")
        .bind(bookId, index + 1, content)
    ),
  ]);
}

export type CreateBookInput = {
  title: string;
  author: string;
  illustrator?: string | null;
  language: string;
  level: string;
  category: string;
  ageGroup?: string | null;
  description?: string | null;
  isEducational?: boolean;
  content: string | string[];
  attributes?: Record<string, unknown>;
};

// Shared by POST /books (admin CRUD, Stage 7) and the publishing workflow's
// publish action (Stage 8) — one place that actually inserts a book row, so
// the two paths can never drift into inserting slightly different shapes.
export async function createBookRecord(db: D1Database, input: CreateBookInput): Promise<string> {
  const pages = toContentArray(input.content);
  const id = crypto.randomUUID();

  // Keeps books.author_id linked for every new book, not just the ones
  // migrations/0009's backfill covered — same find-or-create idiom that
  // migration used, just from app code instead of a one-time SQL backfill.
  const authorId = await findOrCreatePerson(db, "authors", input.author);
  const illustratorId = input.illustrator ? await findOrCreatePerson(db, "illustrators", input.illustrator) : null;

  await db
    .prepare(
      `INSERT INTO books (id, title, author, language, level, total_pages, category, age_group, description, is_educational, attributes, author_id, illustrator_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.title,
      input.author,
      input.language,
      input.level,
      estimatePages(pages),
      input.category,
      input.ageGroup ?? null,
      input.description ?? null,
      input.isEducational ? 1 : 0,
      JSON.stringify(input.attributes ?? {}),
      authorId,
      illustratorId
    )
    .run();

  await replacePages(db, id, pages);
  return id;
}

export type BookVersionRow = {
  id: number;
  book_id: string;
  version_number: number;
  title: string;
  author: string;
  language: string;
  level: string;
  category: string;
  age_group: string | null;
  description: string | null;
  is_educational: number;
  attributes: string;
  content: string;
  edited_by: string | null;
  created_at: string;
};

export function toApiBookVersion(row: BookVersionRow) {
  return {
    id: row.id,
    versionNumber: row.version_number,
    title: row.title,
    author: row.author,
    language: row.language,
    level: row.level,
    category: row.category,
    ageGroup: row.age_group,
    description: row.description,
    isEducational: Boolean(row.is_educational),
    attributes: JSON.parse(row.attributes),
    content: JSON.parse(row.content),
    editedBy: row.edited_by,
    createdAt: row.created_at,
  };
}

// Snapshots a book's current state (its fields as they stand right before an
// edit, plus its current page content) into book_versions — called from
// PATCH /books/:id before applying the update, and from the restore route
// before overwriting current state with an older version (so restoring is
// itself undoable). version_number is per-book, starting at 1.
export async function snapshotBookVersion(db: D1Database, book: BookRow, editedBy: string | null): Promise<void> {
  const content = await getPageContent(db, book.id);
  const nextVersionRow = await db
    .prepare("SELECT COALESCE(MAX(version_number), 0) + 1 as next FROM book_versions WHERE book_id = ?")
    .bind(book.id)
    .first<{ next: number }>();
  const versionNumber = nextVersionRow?.next ?? 1;

  await db
    .prepare(
      `INSERT INTO book_versions (book_id, version_number, title, author, language, level, category, age_group, description, is_educational, attributes, content, edited_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      book.id,
      versionNumber,
      book.title,
      book.author,
      book.language,
      book.level,
      book.category,
      book.age_group,
      book.description,
      book.is_educational,
      book.attributes,
      JSON.stringify(content),
      editedBy
    )
    .run();
}
