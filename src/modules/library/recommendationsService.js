import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realRecommendationsApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

// No cache — like notificationsService.js, this is single-consumer
// (BestForYouCarousel via LibraryPage) and freshness-sensitive (reflects
// what the reader has completed/bookmarked *right now*), so it's fetched
// fresh on each LibraryPage mount rather than hydrated once at boot.
// Returns null (not []) on failure/flag-off/signed-out so the caller can
// distinguish "no real recommendations available, fall back to the plain
// catalogue" from "the API legitimately returned zero books".
export async function getRecommendations() {
  if (!realApiEnabled()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`GET /recommendations failed: ${res.status}`);
    const { books } = await res.json();
    return books;
  } catch (err) {
    console.error('Failed to fetch recommendations from the real API.', err);
    return null;
  }
}
