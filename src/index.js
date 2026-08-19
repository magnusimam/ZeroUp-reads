import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/logger'; // registers observability subscribers on the event bus before any page mounts
import './modules/analytics/statsService'; // registers analytics-tally subscribers before any page mounts
import { syncProgressFromApi } from './services/userService'; // also registers reading-progress subscribers before any page mounts
import { syncBookmarksFromApi } from './modules/reading/bookmarksService';
import { syncBooksFromApi } from './modules/books/booksService';
import { getSession } from './modules/auth/authService';

const root = ReactDOM.createRoot(document.getElementById('root'));

// A brief loading state while syncBooksFromApi() (Stage 6 of the backend
// build) hydrates the book catalogue from the real API — resolves
// instantly, with nothing shown, unless realBooksApi is actually turned on
// (see src/config/featureFlags.js).
root.render(
  <div className="min-h-screen flex items-center justify-center bg-white">
    <span className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
  </div>
);

async function bootstrap() {
  await syncBooksFromApi();
  // Only meaningful for a reader reloading with an existing session — both
  // are per-user/authenticated (unlike the public book catalogue above) and
  // no-op instantly if there's no session, matching the token-gated
  // realApiEnabled() check inside each service.
  if (getSession()) {
    await Promise.all([syncProgressFromApi(), syncBookmarksFromApi()]);
  }
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
