import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as authService from './authService';

const RESEND_COOLDOWN_SECONDS = 20;

export default function CheckEmailPage() {
  const location = useLocation();
  const { email, token } = location.state || {};
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function handleResend() {
    if (!email || cooldown > 0) return;
    authService.requestPasswordReset(email);
    setResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center text-2xl">
            📬
          </div>

          {email ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
              <p className="text-sm text-slate-500 mt-2">
                If an account exists for <span className="font-medium text-slate-700">{email}</span>,
                we've sent a link to reset your password.
              </p>

              {resent && (
                <div className="mt-4 px-4 py-2.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-lg">
                  Link sent again — check your inbox.
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="w-full mt-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend link'}
              </button>

              {token && (
                <div className="mt-6 pt-5 border-t border-dashed border-slate-200 text-left">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">
                    Demo mode — no email service connected yet
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    In production this link would only ever arrive by email. For now, continue directly:
                  </p>
                  <Link
                    to={`/reset-password/${token}`}
                    className="block w-full text-center py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
                  >
                    Continue to reset password
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
              <p className="text-sm text-slate-500 mt-2">
                If you just requested a password reset, look for an email from us with a reset link.
              </p>
              <Link
                to="/forgot-password"
                className="block w-full mt-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                Start over
              </Link>
            </>
          )}

          <p className="text-sm text-slate-500 text-center mt-6">
            <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
