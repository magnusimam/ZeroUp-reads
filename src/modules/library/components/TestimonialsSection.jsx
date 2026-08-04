import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookCoverArt from '../../books/BookCoverArt';

const AVATAR_COLORS = ['#7A3FA0', '#1F6F6B', '#A9762F', '#1F5C33', '#2A3E8C'];

export default function TestimonialsSection({ testimonials, books }) {
  const navigate = useNavigate();

  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-cocoa text-center mb-10">
        Parent &amp; Teacher Picks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => {
          const book = books.find(b => b.id === t.bookId);
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];

          return (
            <div
              key={t.id}
              className="rounded-2xl bg-white border-l-4 border-l-gold border border-gold/15 p-6 flex flex-col gap-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-nunito font-bold text-lg shrink-0"
                  style={{ background: avatarColor }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-nunito font-bold text-charcoal text-sm">{t.name}</p>
                  <p className="font-nunito-sans text-charcoal/50 text-xs">{t.role}</p>
                </div>
              </div>

              <p className="font-nunito-sans italic text-charcoal/75 text-sm leading-relaxed">
                “{t.quote}”
              </p>

              {book && (
                <button
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="flex items-center gap-3 pt-4 border-t border-gold/15 text-left"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
                    <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-semibold text-xs text-charcoal truncate">{book.title}</p>
                    <span className="text-cocoa text-xs font-nunito font-bold">View Details</span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
