import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookCard from './BookCard';
import * as peopleService from './peopleService';

// Shared by AuthorPage.jsx/IllustratorPage.jsx — same entity shape on the
// backend (migrations/0009_authors_illustrators.sql), so one presentational
// component backs both profile pages instead of duplicating the same JSX
// twice. `endpoint`/`label`/`backLabel` are the only per-page differences.
export default function PersonPage({ endpoint, label }) {
  const { id } = useParams();
  const [data, setData] = useState(null); // undefined-until-loaded via null, or 'not-found'

  useEffect(() => {
    let cancelled = false;
    peopleService.getPerson(endpoint, id).then((result) => {
      if (!cancelled) setData(result || 'not-found');
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint, id]);

  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
        <Navbar />
        <div className="flex-1" />
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
            <p className="text-5xl mb-4">✍️</p>
            <h1 className="text-xl font-bold text-story-navy font-nunito">{label} not found</h1>
            <Link to="/library" className="text-story-orange font-nunito font-bold text-sm mt-3 inline-block">
              ← Back to Library
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const person = data[endpoint.slice(0, -1)]; // `author` or `illustrator`
  const { books } = data;

  return (
    <div className="min-h-screen flex flex-col bg-story-cream font-nunito-sans">
      <Navbar />
      <div className="container py-10 flex-1">
        <Link to="/library" className="text-story-orange font-nunito font-bold text-sm">← Back to Library</Link>

        <div className="flex items-center gap-5 mt-4 mb-8">
          {person.photoUrl ? (
            <img src={person.photoUrl} alt={person.name} className="w-20 h-20 rounded-full object-cover shadow-story-card" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-story-lavender flex items-center justify-center font-nunito font-extrabold text-2xl text-story-navy shadow-story-card">
              {person.name[0]}
            </div>
          )}
          <div>
            <h1 className="font-nunito text-2xl font-extrabold text-story-navy">{person.name}</h1>
            <p className="text-ink-secondary text-sm mt-1">{label}</p>
          </div>
        </div>

        {person.bio && <p className="text-ink-secondary leading-relaxed max-w-2xl mb-8">{person.bio}</p>}

        <h2 className="font-nunito text-lg font-extrabold text-story-navy mb-4">Books</h2>
        {books.length === 0 ? (
          <p className="text-ink-secondary text-sm">No books linked to this {label.toLowerCase()} yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
