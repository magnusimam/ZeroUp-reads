import { MOCK_TESTIMONIALS } from '../../utils/mockData';
import { isFeatureEnabled } from '../../config/featureFlags';

const TESTIMONIALS_KEY = 'zeroup_testimonials';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Public endpoint (no per-user token) — same gate shape as
// languagesService.js's realApiEnabled() for GET /languages.
function realApiEnabled() {
  return isFeatureEnabled('realTestimonialsApi') && Boolean(API_BASE_URL);
}

// Hydrates the localStorage testimonials list from the real API — called
// once at app boot (see src/index.js's bootstrap()), same seam as
// languagesService.js's syncLanguagesFromApi(). Never throws; keeps the
// existing cache (or falls through to MOCK_TESTIMONIALS on read) if the
// API's unreachable.
export async function syncTestimonialsFromApi() {
  if (!realApiEnabled()) return;
  try {
    const res = await fetch(`${API_BASE_URL}/testimonials`);
    if (!res.ok) throw new Error(`GET /testimonials failed: ${res.status}`);
    const { testimonials } = await res.json();
    localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
  } catch (err) {
    console.error('Failed to sync testimonials from the real API — keeping the existing list.', err);
  }
}

// Synchronous, like getLanguages() — reads the boot-synced cache, falling
// back to the static MOCK_TESTIMONIALS array if the cache was never
// populated (API never enabled, or unreachable at boot). Still read-only
// (no create/update/delete exists for testimonials today), routed through
// this function boundary rather than imported directly by the page.
export function getTestimonials() {
  const saved = localStorage.getItem(TESTIMONIALS_KEY);
  if (!saved) return MOCK_TESTIMONIALS;
  const testimonials = JSON.parse(saved);
  return testimonials.length > 0 ? testimonials : MOCK_TESTIMONIALS;
}
