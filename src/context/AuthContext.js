import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>{
    //check localStorage on app load - persists after refresh
    const saved = localStorage.getItem('zeroup_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('zeroup_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zeroup_user');
  };

  //Test helpers - keep these for now
  const loginAsReader = () => {
    const reader = { id: '1', name: 'Amina User', email:'amina@example.com', role: 'reader'};
    login(reader);
  };

  const loginAsAdmin = () => {
    const admin = {id:'2', name:'Admin User', email: 'admin@zeroupreads.com', role:'admin'};
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