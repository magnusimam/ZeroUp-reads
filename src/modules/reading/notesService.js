import * as eventBus from '../../utils/eventBus';

// Reader's personal notes while reading — one localStorage-backed service
// (Modular Architecture: single source of truth), keyed by book so
// ReadingPage's Notes drawer only ever reads/writes through here.
const NOTES_KEY = 'zeroup_reading_notes';

function readAll() {
  const raw = localStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeAll(entries) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(entries));
  return entries;
}

export function getNotes(bookId) {
  return (readAll()[bookId] || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addNote(bookId, pageIndex, text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  const all = readAll();
  const note = { id: String(Date.now()), pageIndex, text: trimmed, createdAt: new Date().toISOString() };
  all[bookId] = [...(all[bookId] || []), note];
  writeAll(all);
  eventBus.emit('note.added', { bookId, noteId: note.id, pageIndex });
  return note;
}

export function deleteNote(bookId, noteId) {
  const all = readAll();
  all[bookId] = (all[bookId] || []).filter((note) => note.id !== noteId);
  writeAll(all);
  eventBus.emit('note.deleted', { bookId, noteId });
}
