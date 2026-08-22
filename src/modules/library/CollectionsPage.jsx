import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as collectionsService from './collectionsService';

export default function CollectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [collections, setCollections] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    collectionsService.listCollections().then((all) => {
      if (!cancelled) setCollections((all || []).filter((c) => c.ownerId === user.id));
    });
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  if (!user) return null;

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const result = await collectionsService.createCollection({ name: name.trim(), description: description.trim() || undefined, isPublic });
    setCreating(false);
    if (!result.success) {
      toast?.addToast(result.message || 'Could not create the collection.', 'error');
      return;
    }
    setCollections((prev) => [result.collection, ...(prev || [])]);
    setName('');
    setDescription('');
    setIsPublic(false);
    setShowForm(false);
    toast?.addToast(`Created "${result.collection.name}"`, 'success');
  }

  return (
    <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
      <Navbar />
      <div className="container py-10 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-nunito text-2xl font-extrabold text-story-navy">📚 My Collections</h1>
            <p className="text-ink-secondary text-sm mt-1">Curate reading lists to revisit or share.</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-nunito font-bold text-sm bg-story-orange text-white hover:bg-story-orange-dark transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Collection'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-story-card p-6 mb-8 flex flex-col gap-3 max-w-md">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className="w-full rounded-xl border-2 border-story-navy/10 px-4 py-2.5 text-sm focus:outline-none focus:border-story-orange/40"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full rounded-xl border-2 border-story-navy/10 px-4 py-2.5 text-sm focus:outline-none focus:border-story-orange/40"
            />
            <label className="inline-flex items-center gap-2 text-sm font-nunito font-bold text-story-navy">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Make this collection public
            </label>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="self-start rounded-full px-5 py-2 font-nunito font-bold text-sm bg-story-orange text-white hover:bg-story-orange-dark disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating…' : 'Create Collection'}
            </button>
          </form>
        )}

        {collections === null ? (
          <p className="text-ink-secondary text-sm">Loading your collections…</p>
        ) : collections.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-story-card p-12 text-center">
            <span className="text-5xl inline-block mb-3">📚</span>
            <h2 className="font-nunito font-extrabold text-lg text-story-navy mb-2">No collections yet</h2>
            <p className="text-ink-secondary text-sm">Create one above, or add a book to a new collection from its detail page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.id}`}
                className="bg-white rounded-2xl shadow-story-card p-5 hover:-translate-y-1 transition-transform duration-200"
              >
                <p className="font-nunito font-extrabold text-story-navy">{c.name}</p>
                {c.description && <p className="text-ink-secondary text-sm mt-1 line-clamp-2">{c.description}</p>}
                {c.isPublic && (
                  <span className="inline-block mt-3 text-[11px] font-bold text-green bg-green/10 rounded-full px-2.5 py-0.5">Public</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
