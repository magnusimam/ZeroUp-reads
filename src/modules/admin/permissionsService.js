import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realPermissionsApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

// Administrator-only reference data — returns null when not wired up (flag
// off, unreachable, or no token), so UserManagementPage can just hide the
// panel rather than show an empty one.
export async function getRolePermissions() {
  if (!realApiEnabled()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/permissions/roles`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`GET /permissions/roles failed: ${res.status}`);
    const { rolePermissions } = await res.json();
    return rolePermissions;
  } catch (err) {
    console.error('Failed to fetch role permissions from the real API.', err);
    return null;
  }
}
