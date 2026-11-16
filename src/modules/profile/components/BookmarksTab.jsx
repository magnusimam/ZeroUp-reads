import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import BookCard from '../../books/BookCard';

export default function BookmarksTab({ bookmarkedBooks }) {
  if (bookmarkedBooks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-10 flex flex-col items-center text-center gap-3" style={{ borderColor: 'var(--hero-border)' }}>
        <Bookmark size={36} style={{ color: 'var(--hero-orange)' }} />
        <h3 className="font-nunito font-extrabold text-lg" style={{ color: 'var(--hero-ink)' }}>No bookmarks yet</h3>
        <p className="font-nunito-sans text-sm max-w-sm" style={{ color: 'var(--hero-gray)' }}>
          Books you save will show up here so you can find them easily anytime.
        </p>
        <Link to="/library" className="mt-2 px-6 py-3 rounded-full text-white font-nunito font-bold text-sm" style={{ background: 'var(--sky-blue, #2D6BE4)' }}>
          Explore Books →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {bookmarkedBooks.map(book => <BookCard key={book.id} book={book} variant="tile" />)}
    </div>
  );
}
