import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as authService from './authService';

// Where backend/'s GET /auth/oauth/google/callback redirects to on success
// (OAUTH_FRONTEND_REDIRECT_URL=http://localhost:3000/oauth/callback in
// .dev.vars.example) — see backend/README.md's OAuth (Google) section. Reads
// the `?token=` it appended, then reuses the same AuthContext.login() seam
// every other sign-in path (LoginPage, RegisterPage) already goes through.
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // StrictMode double-invokes effects; a token is single-use server-side state, not idempotent to re-fetch
    ranOnce.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setError('Missing sign-in token.');
      return;
    }

    authService.completeOAuthLogin(token).then((result) => {
      if (result.success) {
        login(result.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message);
      }
    });
  }, [searchParams, login, navigate]);

  return (
    <div className="bg-slate50 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-slate-900 mb-2">Sign-in failed</h1>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <span className="inline-block w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-500">Finishing sign-in with Google…</p>
          </>
        )}
      </div>
    </div>
  );
}
