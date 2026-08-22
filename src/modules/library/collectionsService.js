import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realCollectionsApi') && Boolean(API_BASE_URL);
}

function authHeaders() {
  return getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${options.method || 'GET'} ${path} failed: ${res.status}`);
  return data;
}

// Optional auth on the read side (a guest sees public collections; a
// signed-in caller also sees their own private ones) — returns null (not
// []) when the flag/URL aren't set, so the page can tell "not wired up"
// apart from "genuinely no collections exist yet".
export async function listCollections() {
  if (!realApiEnabled()) return null;
  try {
    const { collections } = await request('/collections');
    return collections;
  } catch (err) {
    console.error('Failed to fetch collections from the real API.', err);
    return null;
  }
}

export async function getCollection(id) {
  if (!realApiEnabled()) return null;
  try {
    return await request(`/collections/${id}`);
  } catch (err) {
    console.error('Failed to fetch the collection from the real API.', err);
    return null;
  }
}

export async function createCollection({ name, description, isPublic }) {
  if (!realApiEnabled() || !getToken()) {
    return { success: false, message: 'Please sign in to create a collection.' };
  }
  try {
    const { collection } = await request('/collections', {
      method: 'POST',
      body: JSON.stringify({ name, description, isPublic }),
    });
    return { success: true, collection };
  } catch (err) {
    return { success: false, message: err.message || 'Could not create the collection. Please try again.' };
  }
}

export async function updateCollection(id, patch) {
  try {
    const { collection } = await request(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    return { success: true, collection };
  } catch (err) {
    return { success: false, message: err.message || 'Could not update the collection. Please try again.' };
  }
}

export async function deleteCollection(id) {
  try {
    await request(`/collections/${id}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || 'Could not delete the collection. Please try again.' };
  }
}

export async function addBookToCollection(id, bookId) {
  try {
    const { books } = await request(`/collections/${id}/books`, { method: 'POST', body: JSON.stringify({ bookId }) });
    return { success: true, books };
  } catch (err) {
    return { success: false, message: err.message || 'Could not add the book to that collection.' };
  }
}

export async function removeBookFromCollection(id, bookId) {
  try {
    const { books } = await request(`/collections/${id}/books/${bookId}`, { method: 'DELETE' });
    return { success: true, books };
  } catch (err) {
    return { success: false, message: err.message || 'Could not remove the book from that collection.' };
  }
}
