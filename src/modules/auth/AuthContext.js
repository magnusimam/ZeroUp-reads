import React, { createContext, useContext, useState } from 'react';
import * as authService from './authService';
import { syncProgressFromApi } from '../../services/userService';
import { syncBookmarksFromApi } from '../reading/bookmarksService';
import { ROLES } from '../../config/roles';

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

  //Test helpers - keep these for now
  const loginAsReader = () => {
    const reader = { id: '1', name: 'Amina User', email: 'amina@example.com', role: 'reader', systemRole: ROLES.READER };
    login(reader);
  };

  const loginAsAdmin = () => {
    const admin = { id: '2', name: 'Admin User', email: 'admin@zeroupreads.com', role: 'admin', systemRole: ROLES.ADMINISTRATOR };
    login(admin);
  };

  // Quick role-switcher for manually exercising the new RBAC-gated pages
  // (Publishing Studio, Translation Workspace, admin panels) without having
  // to register + promote a real account for every role during testing.
  const loginAs = (systemRole) => {
    login({ id: `dev-${systemRole}`, name: `${systemRole[0].toUpperCase()}${systemRole.slice(1)} User`, email: `${systemRole}@zeroupreads.com`, role: systemRole, systemRole });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsReader, loginAsAdmin, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
