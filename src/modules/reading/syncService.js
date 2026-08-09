import * as eventBus from '../../utils/eventBus';

// Reading progress already writes straight to localStorage on every page
// turn (see services/userService.js) — there's no real network call to queue
// today. This just marks that activity happened while offline and flushes
// (clears the flag + emits sync.completed) the moment the browser comes back
// online, so the *architecture and hook point* for a future real backend
// sync exists now, without fabricating network calls that don't exist yet.
const PENDING_SYNC_KEY = 'zeroup_sync_pending';

export function markPendingSync() {
  localStorage.setItem(PENDING_SYNC_KEY, '1');
}

export function hasPendingSync() {
  return localStorage.getItem(PENDING_SYNC_KEY) === '1';
}

function flush() {
  if (!hasPendingSync()) return;
  localStorage.removeItem(PENDING_SYNC_KEY);
  eventBus.emit('sync.completed', {});
}

window.addEventListener('online', flush);
