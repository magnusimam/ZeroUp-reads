import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListPlus, Check } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { isFeatureEnabled } from '../../../config/featureFlags';
import * as collectionsService from '../collectionsService';

// A small "add this book to one of my collections" popover — deliberately
// not a full page, since it's a quick action from wherever a book is being
// looked at (BookDetailPage today). Lists only the caller's own collections
// (an owner check the backend already enforces; this just avoids showing a
// public collection someone else owns as a target to add into).
export default function AddToCollectionButton({ book }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedTo, setAddedTo] = useState(new Set());

  if (!isFeatureEnabled('realCollectionsApi')) return null;

  async function handleOpen() {
    setOpen(true);
    if (collections !== null) return;
    setLoading(true);
    const all = await collectionsService.listCollections();
    setCollections(user ? (all || []).filter((c) => c.ownerId === user.id) : []);
    setLoading(false);
  }

  async function handleAdd(collectionId, name) {
    const result = await collectionsService.addBookToCollection(collectionId, book.id);
    if (result.success) {
      setAddedTo((prev) => new Set(prev).add(collectionId));
      toast?.addToast(`Added "${book.title}" to "${name}"`, 'success');
    } else {
      toast?.addToast(result.message || 'Could not add to that collection.', 'error');
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-2 rounded-full min-h-[52px] px-6 font-nunito font-bold text-[15px] bg-white border-2 border-story-navy/10 text-story-navy hover:border-story-orange/40 transition-all duration-200"
      >
        <ListPlus size={18} /> Add to Collection
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[110%] z-[100] w-72 bg-white rounded-2xl shadow-story-card p-4">
            {!user ? (
              <p className="text-sm text-ink-secondary">
                <Link to="/login" className="text-story-orange font-bold hover:text-story-navy">Sign in</Link> to save books to a collection.
              </p>
            ) : loading ? (
              <p className="text-sm text-ink-secondary">Loading your collections…</p>
            ) : collections.length === 0 ? (
              <p className="text-sm text-ink-secondary">
                You don't have any collections yet. <Link to="/collections" className="text-story-orange font-bold hover:text-story-navy">Create one</Link>.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAdd(c.id, c.name)}
                    disabled={addedTo.has(c.id)}
                    className="flex items-center justify-between gap-2 text-left px-3 py-2 rounded-xl hover:bg-story-cream/60 disabled:opacity-60 transition-colors"
                  >
                    <span className="font-nunito font-bold text-sm text-story-navy truncate">{c.name}</span>
                    {addedTo.has(c.id) && <Check size={16} className="text-green shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
