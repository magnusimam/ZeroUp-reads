import React, { useState } from 'react';
import { X, Trash2, StickyNote } from 'lucide-react';

// Bottom-toolbar "Notes" — a slide-over for jotting thoughts while reading,
// backed by notesService (localStorage, one entry per book). Kept as its own
// drawer rather than reusing ContentsDrawer since it needs a text input +
// list, not just a jump-to-page list.
export default function NotesDrawer({ open, onClose, notes, pageIndex, onAdd, onDelete }) {
  const [draft, setDraft] = useState('');

  if (!open) return null;

  function handleAdd() {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-story-navy/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-story-float flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-story-navy/8">
          <h3 className="font-nunito font-extrabold text-story-navy text-lg">Notes</h3>
          <button onClick={onClose} aria-label="Close notes" className="w-8 h-8 rounded-full flex items-center justify-center text-story-navy/60 hover:bg-story-cream">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-story-navy/8">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Write a note about page ${pageIndex + 1}…`}
            rows={3}
            className="w-full rounded-2xl border border-story-navy/15 px-3.5 py-2.5 text-sm font-nunito-sans text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:border-story-orange resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="mt-2 w-full rounded-full bg-story-orange text-white font-nunito font-bold text-sm py-2.5 disabled:opacity-40 hover:bg-story-orange-dark transition-colors"
          >
            Add Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {notes.length === 0 && (
            <div className="text-center text-ink-secondary text-sm mt-10 flex flex-col items-center gap-2">
              <StickyNote size={28} className="opacity-30" />
              No notes yet for this book.
            </div>
          )}
          {notes.map((note) => (
            <div key={note.id} className="rounded-2xl bg-story-cream/70 px-4 py-3 mb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-nunito font-extrabold text-story-orange">Page {note.pageIndex + 1}</span>
                <button onClick={() => onDelete(note.id)} aria-label="Delete note" className="text-ink-secondary/50 hover:text-coral">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-ink-primary text-sm leading-snug mt-1">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
