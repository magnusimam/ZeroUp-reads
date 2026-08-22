import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realPeopleApi') && Boolean(API_BASE_URL);
}

// `endpoint` is always the literal "authors" or "illustrators" passed by
// AuthorPage.jsx/IllustratorPage.jsx — one generic fetcher backs both pages,
// mirroring the backend's own people/service.ts split (shared logic,
// per-domain thin route files).
export async function getPerson(endpoint, id) {
  if (!realApiEnabled()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`);
    if (!res.ok) throw new Error(`GET /${endpoint}/${id} failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch the ${endpoint.slice(0, -1)} from the real API.`, err);
    return null;
  }
}
