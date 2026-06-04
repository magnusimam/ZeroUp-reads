import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Demo user state — will be replaced with Cloudflare auth in later phases
  const [user, setUser] = useState(null);
  // user shape: { id, name, email, role: 'reader'|'admin', avatar }

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  // Demo login helpers for testing
  const loginAsReader = () =>
    setUser({ id: '1', name: 'Amina Osei', email: 'amina@example.com', role: 'reader' });
  const loginAsAdmin = () =>
    setUser({ id: '2', name: 'Admin User', email: 'admin@zeroupreads.com', role: 'admin' });

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsReader, loginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
