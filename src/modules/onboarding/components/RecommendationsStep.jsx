import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import * as booksService from '../../books/booksService';
import BookCard from '../../books/BookCard';

const RECOMMENDATIONS_COUNT = 6;

// Filters the catalogue by everything the wizard just collected; falls back
// to top-rated books when the intersection is empty so a reader who picked a
// rare combination still lands on a populated, encouraging first screen.
export default function RecommendationsStep({ languages, level, interests, onStartReading, onGoToDashboard }) {
  const recommendations = useMemo(() => {
    const books = booksService.getBooks();
    const matches = books.filter((book) => (
      (!languages.length || languages.includes(book.language)) &&
      (!level || book.level === level) &&
      (!interests.length || interests.includes(book.category))
    ));
    const pool = matches.length ? matches : [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return pool.slice(0, RECOMMENDATIONS_COUNT);
  }, [languages, level, interests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl mx-auto text-center"
    >
      <span className="text-5xl inline-block mb-3" aria-hidden="true">✨</span>
      <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-cocoa mb-1.5">
        Picked just for you
      </h2>
      <p className="font-nunito-sans text-sm text-charcoal/60 mb-8">
        Based on what you told us — you can always explore more in the Library.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {recommendations.map((book) => (
          <BookCard key={book.id} book={book} compact />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => onStartReading(recommendations[0])}
          disabled={!recommendations[0]}
          className="flex-1 py-3 rounded-full bg-coral text-white font-nunito font-bold text-sm disabled:opacity-40 hover:scale-105 transition-transform shadow-card"
        >
          Start Reading
        </button>
        <button
          type="button"
          onClick={onGoToDashboard}
          className="flex-1 py-3 rounded-full border-2 border-gold/30 text-charcoal/70 font-nunito font-bold text-sm hover:bg-gold/10 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
