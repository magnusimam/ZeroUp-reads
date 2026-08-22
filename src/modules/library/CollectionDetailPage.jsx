import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookCard from '../books/BookCard';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as collectionsService from './collectionsService';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null); // { collection, books } | 'not-found'

  useEffect(() => {
    let cancelled = false;
    collectionsService.getCollection(id).then((result) => {
      if (cancelled) return;
      setData(result || 'not-found');
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
        <Navbar />
        <div className="container py-10 flex-1" />
        <Footer />
      </div>
    );
  }

  if (data === 'not-found') {
    return (
      <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-5xl mb-4">📚</p>
            <h1 className="text-xl font-bold text-story-navy font-nunito">Collection not found</h1>
            <Link to="/collections" className="text-story-orange font-nunito font-bold text-sm mt-3 inline-block">
              ← Back to My Collections
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { collection, books } = data;
  const isOwner = user && collection.ownerId === user.id;

  async function handleRemoveBook(bookId) {
    const result = await collectionsService.removeBookFromCollection(collection.id, bookId);
    if (result.success) {
      setData({ collection, books: result.books });
    } else {
      toast?.addToast(result.message || 'Could not remove that book.', 'error');
    }
  }

  async function handleDeleteCollection() {
    const result = await collectionsService.deleteCollection(collection.id);
    if (result.success) {
      toast?.addToast(`Deleted "${collection.name}"`, 'info');
      navigate('/collections');
    } else {
      toast?.addToast(result.message || 'Could not delete this collection.', 'error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
      <Navbar />
      <div className="container py-10 flex-1">
        <Link to="/collections" className="text-story-orange font-nunito font-bold text-sm">← Back to My Collections</Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mt-4 mb-8">
          <div>
            <h1 className="font-nunito text-2xl font-extrabold text-story-navy">{collection.name}</h1>
            {collection.description && <p className="text-ink-secondary text-sm mt-1">{collection.description}</p>}
            {collection.isPublic && (
              <span className="inline-block mt-2 text-[11px] font-bold text-green bg-green/10 rounded-full px-2.5 py-0.5">Public</span>
            )}
          </div>
          {isOwner && (
            <button
              onClick={handleDeleteCollection}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-coral hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} /> Delete Collection
            </button>
          )}
        </div>

        {books.length === 0 ? (
          <p className="text-ink-secondary text-sm">No books in this collection yet — add one from any book's detail page.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveBook(book.id)}
                    aria-label={`Remove "${book.title}" from this collection`}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
