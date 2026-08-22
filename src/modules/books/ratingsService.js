import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realRatingsApi') && Boolean(API_BASE_URL);
}

// Public — an aggregate rating is browsable content. Returns null (not a
// zero-filled object) when the flag/URL aren't set, so BookDetailPage can
// fall back to the book's own static `rating`/`reads` fields exactly as
// before, rather than showing a false "0 ratings" for every book.
export async function getRatingSummary(bookId) {
  if (!realApiEnabled()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/${bookId}`);
    if (!res.ok) throw new Error(`GET /ratings/${bookId} failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch the rating summary from the real API.', err);
    return null;
  }
}

// Requires a signed-in reader — returns null when signed out, same as
// notificationsService.js's "not wired up" posture.
export async function getMyRating(bookId) {
  if (!realApiEnabled() || !getToken()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/${bookId}/mine`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`GET /ratings/${bookId}/mine failed: ${res.status}`);
    const { rating } = await res.json();
    return rating;
  } catch (err) {
    console.error('Failed to fetch the caller\'s own rating from the real API.', err);
    return null;
  }
}

export async function setRating(bookId, rating) {
  if (!realApiEnabled() || !getToken()) {
    return { success: false, message: 'Please sign in to rate this book.' };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ rating }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `PUT /ratings/${bookId} failed: ${res.status}`);
    return { success: true, summary: data };
  } catch (err) {
    return { success: false, message: err.message || 'Could not save your rating. Please try again.' };
  }
}
