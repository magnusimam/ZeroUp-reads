import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/logger'; // registers observability subscribers on the event bus before any page mounts
import './modules/analytics/statsService'; // registers analytics-tally subscribers before any page mounts
import './services/userService'; // registers reading-progress subscribers before any page mounts

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
