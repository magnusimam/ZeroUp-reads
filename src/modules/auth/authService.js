import * as eventBus from '../../utils/eventBus';

const USERS_KEY = 'zeroup_users';
const SESSION_KEY = 'zeroup_user';

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

export function register(name, email, password, role, orgName) {
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
  };

  users.push(newUser);
  saveUsers(users);

  const safeUser = withoutPassword(newUser);
  eventBus.emit('user.registered', { id: safeUser.id, email: safeUser.email, role: safeUser.role });
  return { success: true, user: safeUser };
}

export function login(email, password) {
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

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
