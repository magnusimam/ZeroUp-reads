// Authentication helpers and utilities

const STORAGE_KEY = "zeroup_user";

export const auth = {
  isAuthenticated: false,
  login() {
    this.isAuthenticated = true;
  },
  logout() {
    this.isAuthenticated = false;
  },
};

// auth.js stub version
// when the real Cloudflare API is ready, replace the inside of these
// three functions only. everything else in the app stays the same.

export function registerUser(name, email, password, role, orgName ="") {
  // fake a successful login
  const fakeUser = { name: "Test User", email, role, orgName };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeUser));
  return { success: true, user: fakeUser };
}

export function loginUser(email, password) {
  // fake a successful login
  const fakeUser = { name: "Test User", email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeUser));
  return { success: true, user: fakeUser };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEY);
  return user ? JSON.parse(user) : null;
}
