import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { hasRole } from '../config/roles';

// Route guard for role-gated pages (Publishing Studio, Translation Workspace,
// Admin*) — redirects via useEffect, the same pattern DashboardPage/
// ProfilePage/SettingsPage already use for the logged-out case, extended with
// a role dimension. Centralizing this (instead of each page re-implementing
// its own inline check, as AdminCMSPage/AnalyticsPage previously did with two
// slightly different checks) is what makes "each role only sees pages it has
// permission for" actually enforceable in one place.
export default function RequireRole({ allow, redirectTo = '/library', children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allowed = hasRole(user, allow);

  useEffect(() => {
    if (!allowed) navigate(user ? redirectTo : '/login');
  }, [allowed, user, redirectTo, navigate]);

  if (!allowed) return null;
  return children;
}
