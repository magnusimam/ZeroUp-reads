// Minimal structured logging (Principle 10 — Observability by Default).
// Not wired to a real backend yet; console.info with a consistent JSON shape
// is a start, and gives every call site one place to swap in a real sink later.
import * as eventBus from './eventBus';

function write(level, message, data) {
  const entry = { level, message, data, timestamp: new Date().toISOString() };
  const method = level === 'error' ? console.error : console.info;
  method(`[ZeroUpReads]`, entry);
  return entry;
}

export function logInfo(message, data) {
  return write('info', message, data);
}

export function logError(message, error, data) {
  return write('error', message, { ...data, error: error?.message || String(error) });
}

// Every important domain event (see docs/ENGINEERING_BLUEPRINT.md §13) gets
// logged automatically the moment it's emitted, without each call site
// needing to remember to log it itself.
const TRACKED_EVENTS = [
  'user.registered',
  'user.login.success',
  'user.login.failed',
  'book.uploaded',
  'book.deleted',
  'translation.completed',
  'book.completed',
  'book.bookmarked',
];

TRACKED_EVENTS.forEach((eventName) => {
  eventBus.on(eventName, (payload) => logInfo(eventName, payload));
});
