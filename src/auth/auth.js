// Authentication helpers and utilities

export const auth = {
  isAuthenticated: false,
  login() {
    this.isAuthenticated = true;
  },
  logout() {
    this.isAuthenticated = false;
  },
};
//auth.js- stub version
// when the real cloudflare Api is ready, replace the inside of these
//three functions only. everything else in the app stays the same.

export function registerUser(email, password){
    //fake a successful login
    const fakeUser = { name: "Test User", email};
    localStorage.setItem("zero-up_user", JSON.stringify(fakeUser));
    return { success: true, user: fakeUser};
}

export function loginUser(email, password){
    //fake a successful login
    const fakeUser = { name: "Test User", email};
    localStorage.setItem("zeroup_user", JSON.stringify(fakeUser));
    return { success: true, user: fakeUser };
}

export function logoutUser(){
    localStorage.removeItem("zeroup_user");
}

export function getCurrentUser(){
    const user = localStorage.getItem("zeroup_user"):
    return user ? JSON.parse(user) : null;
}