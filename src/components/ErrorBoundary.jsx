import React from 'react';
import { logError } from '../utils/logger';

// Top-level safety net (Principle 10 — Observability by Default): without this,
// any uncaught render error blanks the whole app silently. Now it's caught,
// logged, and the user gets a recoverable screen instead of a white page.
export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError('Unhandled component error', error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-50">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            This page hit an unexpected error. Try reloading.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
