import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as authService from './authService';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // No real network exists yet, but this stays async-shaped so swapping in
    // a real API call later doesn't change this handler at all.
    setTimeout(() => {
      const result = authService.requestPasswordReset(email);
      setLoading(false);
      if (result.success) {
        navigate('/check-email', { state: { email, token: result.token } });
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    }, 400);
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-500 text-center mt-1 mb-6">
            Enter the email on your account and we'll send you a link to reset it.
          </p>

          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Remembered it after all?{' '}
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
