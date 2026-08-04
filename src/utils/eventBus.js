// Minimal in-process pub/sub so one action (e.g. a book upload) can trigger
// independent effects (logging, future analytics/streaks) without those
// effects being wired inline into the code that performs the action.
const listeners = new Map();

export function on(eventName, handler) {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(handler);
  return () => off(eventName, handler);
}

export function off(eventName, handler) {
  listeners.get(eventName)?.delete(handler);
}

export function emit(eventName, payload) {
  listeners.get(eventName)?.forEach((handler) => handler(payload));
}
