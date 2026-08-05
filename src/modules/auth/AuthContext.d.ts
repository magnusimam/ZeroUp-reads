import { ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'reader' | 'admin';
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  loginAsReader: () => void;
  loginAsAdmin: () => void;
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element;
export function useAuth(): AuthContextValue;
