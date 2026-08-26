import * as eventBus from '../../utils/eventBus';
import { ROLES } from '../../config/roles';
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '../../config/rules';
import { isFeatureEnabled } from '../../config/featureFlags';

const USERS_KEY = 'zeroup_users';
const SESSION_KEY = 'zeroup_user';
const RESETS_KEY = 'zeroup_password_resets';
const TOKEN_KEY = 'zeroup_auth_token';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Stage 4 (frontend integration): register/login route to the real
// backend/ API when the flag is on AND a base URL is actually configured —
// otherwise this always falls back to the existing localStorage mock, the
// same "swap the implementation, not the call site" seam every other
// service in this app already uses (see ENGINEERING_PRINCIPLES_TRACKER.md
// Principle 1).
function realApiEnabled() {
  return isFeatureEnabled('realAuthApi') && Boolean(API_BASE_URL);
}

// Stage 10 (frontend integration): getAllUsers()/setUserRole() route to the
// real backend/ Users API — unlike realApiEnabled() above, this needs a
// signed-in Administrator's token, since /users is authenticated.
function realUserManagementApiEnabled() {
  return isFeatureEnabled('realUserManagementApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

// Stage 17 (frontend integration): requestPasswordReset()/validateResetToken()/
// resetPassword() route to the real backend/ Password Reset API. Same
// default-false, instantly-reversible posture as the other realXApi flags —
// separate from realApiEnabled() above so this one capability can be killed
// independently of register/login if it misbehaves.
function realPasswordResetApiEnabled() {
  return isFeatureEnabled('realPasswordResetApi') && Boolean(API_BASE_URL);
}

function getStoredUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function withoutPassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// The real API's JWT, kept separate from the session's user object so every
// existing reader of getSession()'s shape (ProfilePage, logger, roles.js)
// is unaffected — this is purely for Stage 5+ authenticated requests.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Whether a real backend is configured at all — LoginPage's "Sign in with
// Google" button falls back to a "coming soon" no-op when this is false
// (local dev without backend/ running, or no REACT_APP_API_BASE_URL set),
// same posture as every other realXApi-gated feature.
export function googleOAuthAvailable() {
  return Boolean(API_BASE_URL);
}

// GET /auth/oauth/google/start is a real page navigation (it 302s to
// Google's consent screen), not a fetch — LoginPage just sets
// window.location.href to this.
export function googleOAuthStartUrl() {
  return `${API_BASE_URL}/auth/oauth/google/start`;
}

// The Google OAuth catch-page's job (see backend/README.md's OAuth section
// and OAuthCallbackPage.jsx): the backend redirect already minted a real
// JWT, so this just stores it and fetches the user it belongs to via
// GET /auth/me — no password step, unlike realLogin()/realRegister() above.
export async function completeOAuthLogin(token) {
  setToken(token);
  try {
    const { user } = await authedApiRequest('/auth/me');
    const appUser = fromApiUser(user);
    eventBus.emit('user.login.success', { id: appUser.id, email: appUser.email });
    return { success: true, user: appUser };
  } catch (err) {
    clearToken();
    return { success: false, message: err.message || 'Could not complete Google sign-in. Please try again.' };
  }
}

// Backend's `persona`/`systemRole` naming maps onto this app's existing
// `role`/`systemRole` user shape, so every current reader of a session user
// object (ProfilePage, roles.js's effectiveRole, logger) keeps working
// unchanged regardless of which implementation produced it.
function fromApiUser(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.persona,
    orgName: apiUser.orgName,
    systemRole: apiUser.systemRole,
    // Stage 11 — the single protected Owner account (backend/migrations/
    // 0004_owner_flag.sql). No mock/localStorage equivalent: is_owner is a
    // real-database-only, manually-bootstrapped concept, so this is
    // undefined (falsy) on the mock path, same as a user who isn't one.
    isOwner: apiUser.isOwner,
  };
}

// Generic authenticated request, distinct from apiRequest() below (which is
// specifically the unauthenticated register/login shape that sets a new
// token on success) — used by the Stage 10 Users API calls, which need a
// bearer token and don't set one.
async function authedApiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${options.method || 'GET'} ${path} failed: ${res.status}`);
  return data;
}

async function apiRequest(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.error || 'Something went wrong. Please try again.' };
  }
  setToken(data.token);
  return { success: true, user: fromApiUser(data.user) };
}

async function realRegister(name, email, password, role, orgName) {
  try {
    const result = await apiRequest('/auth/register', { name, email, password, persona: role, orgName });
    if (result.success) {
      eventBus.emit('user.registered', { id: result.user.id, email: result.user.email, role: result.user.role });
    }
    return result;
  } catch {
    return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
  }
}

async function mockRegister(name, email, password, role, orgName) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'This email is already registered.' };
  }

  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    orgName: orgName.trim(),
    // Every self-serve signup starts as a Reader — Translator/Author/Editor/
    // Publisher/Administrator are granted, not self-selected at signup (see
    // /admin/users), matching how real publishing permissions work.
    systemRole: ROLES.READER,
  };

  users.push(newUser);
  saveUsers(users);

  const safeUser = withoutPassword(newUser);
  eventBus.emit('user.registered', { id: safeUser.id, email: safeUser.email, role: safeUser.role });
  return { success: true, user: safeUser };
}

export async function register(name, email, password, role, orgName) {
  if (realApiEnabled()) return realRegister(name, email, password, role, orgName);
  return mockRegister(name, email, password, role, orgName);
}

// User & Role Management (/admin/users, administrator-only) — every
// registered user, password stripped, for the promote/demote table. Unlike
// booksService/userService's "sync a localStorage cache" seam, this has
// exactly one call site (useUserManagement.js), so it goes straight to the
// real API when enabled rather than through a background-mirrored cache.
export async function getAllUsers() {
  if (realUserManagementApiEnabled()) {
    try {
      const { users } = await authedApiRequest('/users');
      return users.map(fromApiUser);
    } catch (err) {
      console.error('Failed to fetch users from the real API — falling back to the local mock list.', err);
    }
  }
  return getStoredUsers().map(withoutPassword);
}

export async function setUserRole(userId, systemRole) {
  if (realUserManagementApiEnabled()) {
    try {
      const { user } = await authedApiRequest(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ systemRole }),
      });
      eventBus.emit('user.role.changed', { id: userId, systemRole });
      return { success: true, user: fromApiUser(user) };
    } catch (err) {
      return { success: false, message: err.message || 'Could not reach the server. Please check your connection and try again.' };
    }
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, message: 'User not found.' };

  target.systemRole = systemRole;
  saveUsers(users);
  eventBus.emit('user.role.changed', { id: userId, systemRole });
  return { success: true, user: withoutPassword(target) };
}

async function realLogin(email, password) {
  try {
    const result = await apiRequest('/auth/login', { email, password });
    if (result.success) {
      eventBus.emit('user.login.success', { id: result.user.id, email: result.user.email });
    } else {
      eventBus.emit('user.login.failed', { email: email.trim().toLowerCase() });
    }
    return result;
  } catch {
    return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
  }
}

async function mockLogin(email, password) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password
  );

  if (!user) {
    eventBus.emit('user.login.failed', { email: normalizedEmail });
    return { success: false, message: 'Invalid email or password.' };
  }

  const safeUser = withoutPassword(user);
  eventBus.emit('user.login.success', { id: safeUser.id, email: safeUser.email });
  return { success: true, user: safeUser };
}

export async function login(email, password) {
  if (realApiEnabled()) return realLogin(email, password);
  return mockLogin(email, password);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  clearToken();
}

function getResets() {
  const raw = localStorage.getItem(RESETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveResets(resets) {
  localStorage.setItem(RESETS_KEY, JSON.stringify(resets));
}

function generateToken() {
  return typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Always resolves { success: true } even for an email that isn't registered —
// never let this endpoint's response reveal which emails exist in the system.
// The token IS returned here only because no real email-sending backend
// exists yet; once one does, this function stops returning it (the email is
// the only place the token would appear) and CheckEmailPage's demo shortcut
// link disappears on its own since it reads the response, not a hardcoded UI.
function mockRequestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getStoredUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    eventBus.emit('user.password_reset.requested', { email: normalizedEmail, found: false });
    return { success: true };
  }

  const token = generateToken();
  const now = Date.now();
  const resets = getResets().filter((r) => r.email !== normalizedEmail); // one live token per email
  resets.push({
    token,
    email: normalizedEmail,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  saveResets(resets);

  eventBus.emit('user.password_reset.requested', { email: normalizedEmail, found: true });
  return { success: true, token };
}

// Stage 17: routes to the real backend/ Password Reset API (same
// realApiEnabled() gate as register/login — password reset is the same auth
// domain) — same shape as the mock above, including the token-in-response
// stopgap (see backend/README.md's Password reset section for why).
async function realRequestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    });
    const data = await res.json().catch(() => ({}));
    eventBus.emit('user.password_reset.requested', { email: normalizedEmail, found: Boolean(data.token) });
    return data.token ? { success: true, token: data.token } : { success: true };
  } catch {
    return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
  }
}

export async function requestPasswordReset(email) {
  if (realPasswordResetApiEnabled()) return realRequestPasswordReset(email);
  return mockRequestPasswordReset(email);
}

function mockValidateResetToken(token) {
  const reset = getResets().find((r) => r.token === token);
  if (!reset) return { valid: false, reason: 'This link is invalid.' };
  if (new Date(reset.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'This link has expired.' };
  }
  return { valid: true, email: reset.email };
}

async function realValidateResetToken(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/password-reset/${encodeURIComponent(token)}`);
    return await res.json();
  } catch {
    return { valid: false, reason: 'Could not reach the server. Please check your connection and try again.' };
  }
}

export async function validateResetToken(token) {
  if (realPasswordResetApiEnabled()) return realValidateResetToken(token);
  return mockValidateResetToken(token);
}

function mockResetPassword(token, newPassword) {
  const validation = mockValidateResetToken(token);
  if (!validation.valid) {
    return { success: false, message: validation.reason };
  }

  const users = getStoredUsers();
  const user = users.find((u) => u.email === validation.email);
  if (!user) {
    return { success: false, message: 'This account no longer exists.' };
  }

  user.password = newPassword;
  saveUsers(users);
  saveResets(getResets().filter((r) => r.token !== token));

  eventBus.emit('user.password_reset.completed', { email: validation.email });
  return { success: true };
}

async function realResetPassword(token, newPassword) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/password-reset/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data.message || 'Something went wrong. Please try again.' };
    }
    eventBus.emit('user.password_reset.completed', {});
    return { success: true };
  } catch {
    return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
  }
}

export async function resetPassword(token, newPassword) {
  if (realPasswordResetApiEnabled()) return realResetPassword(token, newPassword);
  return mockResetPassword(token, newPassword);
}
