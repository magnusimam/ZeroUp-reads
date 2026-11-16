import React from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../../books/BookCard';

function BookGrid({ books, emptyText }) {
  if (books.length === 0) {
    return (
      <p className="font-nunito-sans text-sm py-6 text-center" style={{ color: 'var(--hero-gray)' }}>{emptyText}</p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {books.map(book => <BookCard key={book.id} book={book} variant="tile" />)}
    </div>
  );
}

export default function MyBooksTab({ continueReadingBooks, completedBooks }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--hero-border)' }}>
        <h3 className="font-nunito font-extrabold text-[15px] mb-4" style={{ color: 'var(--hero-ink)' }}>Continue Reading</h3>
        <BookGrid books={continueReadingBooks} emptyText="Nothing in progress yet — start a book from the Library." />
      </div>

      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--hero-border)' }}>
        <h3 className="font-nunito font-extrabold text-[15px] mb-4" style={{ color: 'var(--hero-ink)' }}>Completed</h3>
        <BookGrid books={completedBooks} emptyText="No finished books yet — they'll collect here as you complete them." />
      </div>

      {continueReadingBooks.length === 0 && completedBooks.length === 0 && (
        <Link to="/library" className="self-start px-6 py-3 rounded-full text-white font-nunito font-bold text-sm" style={{ background: 'var(--hero-green)' }}>
          Explore Books →
        </Link>
      )}
    </div>
  );
}
