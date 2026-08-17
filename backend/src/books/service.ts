import { WORDS_PER_PAGE } from "../config/rules";

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

  await db
    .prepare(
      `INSERT INTO books (id, title, author, language, level, total_pages, category, age_group, description, is_educational, attributes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      JSON.stringify(input.attributes ?? {})
    )
    .run();

  await replacePages(db, id, pages);
  return id;
}
