import { useEffect, useMemo, useState } from 'react';
import * as offlineService from './offlineService';
import * as booksService from '../books/booksService';
import * as eventBus from '../../utils/eventBus';
import { sortBooks, preferCoveredBooks } from '../library/libraryConfig';
import { OFFLINE_STORAGE_QUOTA_BYTES, POPULAR_DOWNLOADS_COUNT } from '../../config/rules';

export const DOWNLOAD_TABS = [
  { id: 'all', label: 'All Downloads', icon: '▦' },
  { id: 'books', label: 'Books', icon: '📖' },
  // Audio narration, printable activity sheets and saved web articles aren't
  // real features yet (no data model backs any of them) — kept as visible,
  // clearly-empty tabs rather than pretending they work.
  { id: 'audio', label: 'Audio Stories', icon: '🎧' },
  { id: 'activities', label: 'Activity Sheets', icon: '📄' },
  { id: 'articles', label: 'Saved Articles', icon: '🔖' },
];

// Downloads page state: what's actually saved offline (real, per-device data
// from offlineService), storage usage against the fixed quota, and a
// "Popular Downloads" row to help an empty-handed reader start (Separation
// of Concerns — OfflinePage stays presentational).
export default function useDownloadsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);

  // DownloadButton (rendered per-card) is the thing that actually calls
  // offlineService.downloadBook()/removeDownload() — this page reacts to
  // those through the event bus instead of threading a refresh callback
  // down into every card (Event-Driven Architecture).
  useEffect(() => {
    const offDownloaded = eventBus.on('book.downloaded', () => setRefreshTick(t => t + 1));
    const offRemoved = eventBus.on('book.download.removed', () => setRefreshTick(t => t + 1));
    return () => { offDownloaded(); offRemoved(); };
  }, []);

  // refreshTick isn't read inside these — it's a deliberate manual cache-bust
  // signal (offlineService reads straight from localStorage, so there's
  // nothing else these could depend on to know it changed).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const downloadedEntries = useMemo(() => offlineService.getDownloadEntries(), [refreshTick]);
  const downloadedBooks = useMemo(() => downloadedEntries.map(e => e.book), [downloadedEntries]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usedBytes = useMemo(() => offlineService.getStorageUsedBytes(), [refreshTick]);
  const usedLabel = offlineService.formatBytes(usedBytes);
  const quotaLabel = offlineService.formatBytes(OFFLINE_STORAGE_QUOTA_BYTES);
  const usedPercent = Math.min(100, (usedBytes / OFFLINE_STORAGE_QUOTA_BYTES) * 100);

  const popularBooks = useMemo(() => {
    const catalogue = booksService.getBooks().filter(b => !offlineService.isDownloaded(b.id));
    return sortBooks(preferCoveredBooks(catalogue), 'rating').slice(0, POPULAR_DOWNLOADS_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  // "Books" and "All Downloads" both show the real downloaded list — books
  // are the only downloadable content type this app has today. The other
  // tabs stay genuinely empty rather than silently reusing the books list.
  const visibleBooks = activeTab === 'audio' || activeTab === 'activities' || activeTab === 'articles'
    ? []
    : downloadedBooks;

  return {
    activeTab, setActiveTab,
    downloadedEntries, downloadedBooks, visibleBooks,
    usedBytes, usedLabel, quotaLabel, usedPercent,
    popularBooks,
  };
}
