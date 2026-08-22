import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realRatingsApi') && Boolean(API_BASE_URL);
}

// Public — returns [] (not null) when off/unreachable, since an empty
// review list and "not wired up" render identically here (no fallback data
// to preserve, unlike ratingsService's aggregate).
export async function getReviews(bookId) {
  if (!realApiEnabled()) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${bookId}`);
    if (!res.ok) throw new Error(`GET /reviews/${bookId} failed: ${res.status}`);
    const { reviews } = await res.json();
    return reviews;
  } catch (err) {
    console.error('Failed to fetch reviews from the real API.', err);
    return [];
  }
}

export async function setReview(bookId, reviewText) {
  if (!realApiEnabled() || !getToken()) {
    return { success: false, message: 'Please sign in to leave a review.' };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ reviewText }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `PUT /reviews/${bookId} failed: ${res.status}`);
    return { success: true, review: data.review };
  } catch (err) {
    return { success: false, message: err.message || 'Could not save your review. Please try again.' };
  }
}

export async function deleteReview(bookId) {
  if (!realApiEnabled() || !getToken()) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${bookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`DELETE /reviews/${bookId} failed: ${res.status}`);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || 'Could not delete your review. Please try again.' };
  }
}
