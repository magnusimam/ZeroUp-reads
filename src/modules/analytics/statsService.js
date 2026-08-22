import { MOCK_STATS } from '../../utils/mockData';
import * as eventBus from '../../utils/eventBus';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const STATS_KEY = 'zeroup_stats';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Administrator-only endpoint — same three-part gate as bookmarksService.js.
function realApiEnabled() {
  return isFeatureEnabled('realAnalyticsApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

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

// No localStorage cache here (unlike getStats() above) — AnalyticsPage.jsx
// is this function's only caller and always wants a fresh number, not a
// snapshot from whenever the admin last loaded the page. Falls through to
// the caller catching and using getStats() instead, same "keep the local
// copy on failure" posture as booksService.js's syncBooksFromApi().
export async function getStatsFromApi() {
  if (!realApiEnabled()) throw new Error('Real analytics API is not enabled.');
  const res = await fetch(`${API_BASE_URL}/analytics`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`GET /analytics failed: ${res.status}`);
  return res.json();
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
