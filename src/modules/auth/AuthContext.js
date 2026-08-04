import React, { createContext, useContext, useState } from 'react';
import * as authService from './authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession());

  const login = (userData) => {
    setUser(userData);
    authService.setSession(userData);
  };

  const logout = () => {
    setUser(null);
    authService.clearSession();
  };

  //Test helpers - keep these for now
  const loginAsReader = () => {
    const reader = { id: '1', name: 'Amina User', email: 'amina@example.com', role: 'reader' };
    login(reader);
  };

  const loginAsAdmin = () => {
    const admin = { id: '2', name: 'Admin User', email: 'admin@zeroupreads.com', role: 'admin' };
    login(admin);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsReader, loginAsAdmin}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
