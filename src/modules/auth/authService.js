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
  };
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
// registered user, password stripped, for the promote/demote table.
export function getAllUsers() {
  return getStoredUsers().map(withoutPassword);
}

export function setUserRole(userId, systemRole) {
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
export function requestPasswordReset(email) {
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

export function validateResetToken(token) {
  const reset = getResets().find((r) => r.token === token);
  if (!reset) return { valid: false, reason: 'This link is invalid.' };
  if (new Date(reset.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'This link has expired.' };
  }
  return { valid: true, email: reset.email };
}

export function resetPassword(token, newPassword) {
  const validation = validateResetToken(token);
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
