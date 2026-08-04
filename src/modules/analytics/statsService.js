import { MOCK_STATS } from '../../utils/mockData';
import * as eventBus from '../../utils/eventBus';

const STATS_KEY = 'zeroup_stats';

function readStats() {
  const raw = localStorage.getItem(STATS_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(STATS_KEY, JSON.stringify(MOCK_STATS));
  return MOCK_STATS;
}

function writeStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function getStats() {
  return readStats();
}

// Keeps the Analytics dashboard live instead of a frozen MOCK_STATS snapshot —
// subscribed once at app boot (see src/index.js) so counts update regardless
// of which page the admin happens to be on when the event fires.
eventBus.on('book.uploaded', () => {
  const stats = readStats();
  writeStats({ ...stats, totalBooks: stats.totalBooks + 1 });
});

eventBus.on('book.completed', () => {
  const stats = readStats();
  writeStats({
    ...stats,
    booksReadThisWeek: stats.booksReadThisWeek + 1,
    completionsThisWeek: stats.completionsThisWeek + 1,
  });
});
