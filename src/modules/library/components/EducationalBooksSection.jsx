import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookCoverArt from '../../books/BookCoverArt';
import { EDUCATIONAL_TOPICS, EDUCATIONAL_SMALL_COUNT } from '../libraryConfig';
import useSectionFilter from '../useSectionFilter';

export default function EducationalBooksSection({ books, viewAll = false }) {
  const navigate = useNavigate();
  const {
    selected: topic, open: topicOpen, setOpen: setTopicOpen, select: selectTopic, filtered: topicFiltered,
  } = useSectionFilter(books, (b) => b.category);

  const featuredBook = topicFiltered[0];
  const smallBooks = topicFiltered
    .filter(b => b.id !== featuredBook?.id)
    .slice(0, viewAll ? topicFiltered.length : EDUCATIONAL_SMALL_COUNT);

  return (
    <section id="educational-books" className="max-w-content mx-auto w-full px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 rounded-full bg-gold" aria-hidden="true" />
          <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-cocoa">Educational Books</h2>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setTopicOpen(o => !o)}
              className="px-4 py-2 rounded-full border border-gold/30 text-charcoal/70 text-sm font-nunito font-semibold hover:border-gold hover:text-cocoa transition-colors"
            >
              {topic || 'Choose Topic'} <span aria-hidden="true">{topicOpen ? '▲' : '▼'}</span>
            </button>
            {topicOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTopicOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gold/25 bg-white shadow-xl z-20 py-2">
                  <button
                    onClick={() => selectTopic(null)}
                    className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                      !topic ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                    }`}
                  >
                    All Topics
                  </button>
                  {EDUCATIONAL_TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => selectTopic(t)}
                      className={`w-full text-left px-4 py-2 text-sm font-nunito-sans transition-colors ${
                        topic === t ? 'text-cocoa font-bold' : 'text-charcoal/70 hover:text-cocoa'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/library?type=educational')}
            className="px-4 py-2 rounded-full bg-gold/10 text-cocoa text-sm font-nunito font-bold hover:bg-gold/20 transition-colors"
          >
            Explore All Resources →
          </button>
        </div>
      </div>

      {!featuredBook ? (
        <p className="text-charcoal/40 font-nunito-sans text-sm text-center py-10">
          No educational resources match your filters yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured wide card */}
          <div
            className="lg:col-span-3 rounded-2xl overflow-hidden border border-gold/25 bg-white grid grid-cols-1 sm:grid-cols-2 cursor-pointer group"
            onClick={() => navigate(`/read/${featuredBook.id}`)}
          >
            <div className="relative h-48 sm:h-full min-h-[220px]">
              <BookCoverArt category={featuredBook.category} style={{ position: 'absolute', inset: 0 }} />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-gold text-xs font-nunito font-bold tracking-[0.15em] uppercase mb-3">
                Premium Resource
              </span>
              <h3 className="font-playfair font-bold text-xl sm:text-2xl text-cocoa mb-3 leading-snug">
                {featuredBook.title}
              </h3>
              <p className="font-nunito-sans text-charcoal/60 text-sm leading-relaxed mb-6">
                {featuredBook.description}
              </p>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/read/${featuredBook.id}`); }}
                className="self-start px-6 py-3 rounded-xl bg-gold text-ink font-nunito font-bold text-sm hover:opacity-90 transition-opacity group-hover:scale-[1.02]"
              >
                Open Library
              </button>
            </div>
          </div>

          {/* Smaller list cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {smallBooks.map(book => (
              <button
                key={book.id}
                onClick={() => navigate(`/read/${book.id}`)}
                className="flex items-center gap-4 p-3 rounded-xl border border-gold/15 bg-black/[0.02] hover:border-gold/50 hover:bg-black/[0.04] transition-colors text-left"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <BookCoverArt category={book.category} style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-sm text-charcoal truncate">{book.title}</p>
                  <p className="font-nunito-sans text-xs text-charcoal/50">{book.category}</p>
                </div>
                <span className="text-cocoa text-sm font-nunito font-bold shrink-0">Study →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
