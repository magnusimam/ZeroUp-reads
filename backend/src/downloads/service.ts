export type DownloadRow = { id: number; user_id: string; book_id: string; downloaded_at: string };

export function toApiDownload(row: DownloadRow) {
  return { id: row.id, bookId: row.book_id, downloadedAt: row.downloaded_at };
}

export async function recordDownload(db: D1Database, userId: string, bookId: string): Promise<void> {
  await db.prepare("INSERT INTO downloads (user_id, book_id) VALUES (?, ?)").bind(userId, bookId).run();
}

export async function listDownloads(db: D1Database, userId: string): Promise<DownloadRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM downloads WHERE user_id = ? ORDER BY downloaded_at DESC")
    .bind(userId)
    .all<DownloadRow>();
  return results;
}
