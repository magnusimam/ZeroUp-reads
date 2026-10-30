// Row types, DB→API mappers and shared queries for the Translation workflow
// (migrations/0017_translations.sql). The API shapes match the frontend's
// translationRequestService.js / translationService.js objects field-for-field,
// so switching those services onto this API is a fetch change, not a reshape.

export type RequestRow = {
  id: string;
  book_id: string;
  book_title: string;
  language: string;
  status: string;
  requested_by: string;
  translated_book_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DraftRow = {
  id: string;
  book_id: string;
  book_title: string;
  source_language: string;
  target_language: string;
  translator_id: string;
  translator_name: string;
  status: string;
  translated_book_id: string | null;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
};

type ParagraphRow = { original: string; translated: string };
type HistoryRow = { status: string; by_user_id: string; by_name: string; comment: string | null; at: string };

export function toApiRequest(row: RequestRow) {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    language: row.language,
    status: row.status,
    requestedBy: row.requested_by,
    translatedBookId: row.translated_book_id,
    requestedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toApiDraftSummary(row: DraftRow) {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    status: row.status,
    translatorId: row.translator_id,
    translatorName: row.translator_name,
    translatedBookId: row.translated_book_id,
    lastSavedAt: row.last_saved_at,
  };
}

const REQUEST_SELECT = `SELECT r.*, b.title as book_title FROM translation_requests r JOIN books b ON r.book_id = b.id`;
const DRAFT_SELECT = `SELECT d.*, b.title as book_title, u.name as translator_name
  FROM translation_drafts d JOIN books b ON d.book_id = b.id JOIN users u ON d.translator_id = u.id`;

export async function getRequestRow(db: D1Database, id: string): Promise<RequestRow | null> {
  return db.prepare(`${REQUEST_SELECT} WHERE r.id = ?`).bind(id).first<RequestRow>();
}

export async function listRequestRows(db: D1Database, statuses: string[]): Promise<RequestRow[]> {
  const placeholders = statuses.map(() => "?").join(", ");
  const { results } = await db
    .prepare(`${REQUEST_SELECT} WHERE r.status IN (${placeholders}) ORDER BY r.created_at DESC`)
    .bind(...statuses)
    .all<RequestRow>();
  return results;
}

export async function getDraftRow(db: D1Database, id: string): Promise<DraftRow | null> {
  return db.prepare(`${DRAFT_SELECT} WHERE d.id = ?`).bind(id).first<DraftRow>();
}

export async function listDraftRows(db: D1Database, translatorId: string | null): Promise<DraftRow[]> {
  const query = translatorId
    ? db.prepare(`${DRAFT_SELECT} WHERE d.translator_id = ? ORDER BY d.updated_at DESC`).bind(translatorId)
    : db.prepare(`${DRAFT_SELECT} ORDER BY d.updated_at DESC`);
  const { results } = await query.all<DraftRow>();
  return results;
}

// A translator's open (not yet approved) draft for this book+language, if
// any — POST /translations/drafts resumes it instead of starting a blank one,
// same as translationService.js's startDraft().
export async function findOpenDraftRow(
  db: D1Database,
  bookId: string,
  targetLanguage: string,
  translatorId: string
): Promise<DraftRow | null> {
  return db
    .prepare(
      `${DRAFT_SELECT} WHERE d.book_id = ? AND d.target_language = ? AND d.translator_id = ? AND d.status != 'approved'
       ORDER BY d.created_at DESC LIMIT 1`
    )
    .bind(bookId, targetLanguage, translatorId)
    .first<DraftRow>();
}

export async function getParagraphs(db: D1Database, draftId: string): Promise<ParagraphRow[]> {
  const { results } = await db
    .prepare("SELECT original, translated FROM translation_draft_paragraphs WHERE draft_id = ? ORDER BY paragraph_index ASC")
    .bind(draftId)
    .all<ParagraphRow>();
  return results;
}

async function getHistory(db: D1Database, draftId: string) {
  const { results } = await db
    .prepare("SELECT * FROM translation_draft_history WHERE draft_id = ? ORDER BY at ASC, id ASC")
    .bind(draftId)
    .all<HistoryRow>();
  return results.map((row) => ({
    status: row.status,
    byUserId: row.by_user_id,
    byName: row.by_name,
    comment: row.comment,
    at: row.at,
  }));
}

export async function toApiDraftDetail(db: D1Database, row: DraftRow) {
  const [paragraphs, history] = await Promise.all([getParagraphs(db, row.id), getHistory(db, row.id)]);
  return { ...toApiDraftSummary(row), paragraphs, history };
}

export async function pushDraftHistory(
  db: D1Database,
  draftId: string,
  status: string,
  byUserId: string,
  byName: string,
  comment?: string
): Promise<void> {
  await db.batch([
    db
      .prepare("UPDATE translation_drafts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(status, draftId),
    db
      .prepare("INSERT INTO translation_draft_history (draft_id, status, by_user_id, by_name, comment) VALUES (?, ?, ?, ?, ?)")
      .bind(draftId, status, byUserId, byName, comment ?? null),
  ]);
}
