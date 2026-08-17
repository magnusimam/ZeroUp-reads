import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/logger'; // registers observability subscribers on the event bus before any page mounts
import './modules/analytics/statsService'; // registers analytics-tally subscribers before any page mounts
import './services/userService'; // registers reading-progress subscribers before any page mounts
import { syncBooksFromApi } from './modules/books/booksService';

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
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
