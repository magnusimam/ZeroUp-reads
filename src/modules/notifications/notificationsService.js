import * as eventBus from '../../utils/eventBus';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Per-user endpoint — same three-part gate as bookmarksService.js's
// realApiEnabled(): flag, base URL, and a signed-in token.
function realApiEnabled() {
  return isFeatureEnabled('realNotificationsApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${res.status}`);
  return res.json();
}

// No localStorage cache, unlike bookmarks/progress/books — notifications are
// single-consumer (the dashboard bell) and freshness-sensitive (another
// user's action server-side should show up next time the bell is opened,
// not stay stuck at whatever was cached at boot), so this is fetched fresh
// by its one caller (useDashboardData.js) rather than hydrated once and read
// synchronously everywhere.
//
// Returns null (not a zero-filled object) when the API isn't enabled, so the
// caller can tell "not wired up, keep whatever fallback you had" apart from
// "wired up and there really are zero notifications right now" — the two
// need different UI (silently keep the old fake count vs. show a real,
// honest empty state).
export async function fetchNotifications() {
  if (!realApiEnabled()) return null;
  try {
    return await apiRequest('/notifications');
  } catch (err) {
    console.error('Failed to fetch notifications from the real API.', err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAsRead(id) {
  if (!realApiEnabled()) return;
  try {
    await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.error(`Failed to mark notification ${id} as read.`, err);
  }
}

export async function markAllAsRead() {
  if (!realApiEnabled()) return;
  try {
    await apiRequest('/notifications/read-all', { method: 'POST' });
    eventBus.emit('notifications.read_all', {});
  } catch (err) {
    console.error('Failed to mark all notifications as read.', err);
  }
}
