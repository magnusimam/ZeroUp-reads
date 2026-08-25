import React, { createContext, useContext, useState } from 'react';
import * as authService from './authService';
import { syncProgressFromApi } from '../../services/userService';
import { syncBookmarksFromApi } from '../reading/bookmarksService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession());

  const login = (userData) => {
    setUser(userData);
    authService.setSession(userData);
    // Hydrates the reading-progress/bookmarks localStorage caches from the
    // real API now that a token exists (see userService.js's
    // syncProgressFromApi()) — a no-op unless realProgressApi/
    // realBookmarksApi are actually on. Fire-and-forget: login shouldn't
    // block on this, and both fail safe by keeping whatever's cached.
    syncProgressFromApi();
    syncBookmarksFromApi();
  };

  const logout = () => {
    setUser(null);
    authService.clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
