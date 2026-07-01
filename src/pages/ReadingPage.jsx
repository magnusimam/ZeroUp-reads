import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MOCK_BOOKS, isBookmarked, toggleBookmark } from '../utils/mockData';

export default function ReadingPage() {
  const { bookId } = useParams();

  const book = MOCK_BOOKS.find((b) => b.id === bookId);

  const [pageIndex, setPageIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(bookId));

  useEffect(() => {
    if (book) setBookmarked(isBookmarked(book.id));
  }, [book]);

  //if book doesn't exist
  if (!book) {
    return (
      <div className='bg-slate-50 min-h-screen flex flex-col'>
        <Navbar />
        <div className='flex items-center justify-center px-6'>
         <div className='text-center'>
          <p className='text-4xl mb-4'>📖</p>
          <h1 className='text-xl font-bold text-slate-900'>Book not found</h1>
          <Link to="/library" className='text-teal-600 font-medium text-sm mt-3 inline-block'>
              Back to Library
          </Link>
         </div>
        </div>
        < Footer />
      </div>
    );
  }


  const totalPages = book.content.length;
  const isLastPage = pageIndex === totalPages - 1;
  const isFirstPage = pageIndex === 0;

  function nextPage(){
    if (!isLastPage) {
      setPageIndex(pageIndex + 1);
    } else {
      // Reached the end - mark as completed(stub for now)
      alert( 'You finished the book!');
    }
  }

  function prevPage(){
    if (!isFirstPage)  setPageIndex(pageIndex - 1);
  }

  function increaseFont() {
    setFontSize((f) => Math.min(f + 2, 28));
  }

  function decreaseFont() {
    setFontSize((f) => Math.max(f - 2, 14));
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      {/*--- TOP BAR ---*/}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
           to="/library"
           className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Back to Library
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked((current) => {
                const updated = toggleBookmark(book.id);
                return updated.includes(book.id);
              })}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors ${
                bookmarked ? 'bg-amber-100 border-amber-300 text-amber-600' : 'border-slate-300 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {bookmarked ? '★' : '☆'}
            </button>
            <button
              onClick={decreaseFont}
              className="w-8 h-8 rounded-full border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-100"
            >
              A-
            </button>
            <button
            onClick={increaseFont}
             className="w-8 h-8 rounded-full border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-100">
              A+
              </button>
          </div>
        </div>
      </div>

      {/*---BOOK HEADER---*/}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-6 text-center">
        <div className="w-28 h-40 mx-auto mb-5 rounded-lg bg-gradient-to-br from-teal-600 to-slate-800 flex items-center justify-center text-3xl">
          📚
        </div>
       
        <h1 className="text-2xl font-bold text-slate-900">
          {book.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{book.author}</p>

        <div className="flex gap-2 justify-center mt-3">
          <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">
            {book.language}
          </span>
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            {book.level}
          </span>
        </div>
      </div>

      {/*-- CONTENT AREA--*/}
      <div className="max-w-3xl mx-auto px-6 py-8 bg-white rounded-xl border border-slate-200 mb-8 w-full">
        <p 
        className="leading-relaxed text-slate-800 transition-all"
        style={{fontSize: `${fontSize}px`}}>
          {book.content[pageIndex]}
        </p>
      </div>

      {/*--PAGE NAVIGATION--*/}
      <div className="max-w-2xl mx-auto px-6 pb-14 flex items-center justify-between w-full">
        <button
        onClick={prevPage}
        disabled={isFirstPage}
        className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
          Previous
        </button>

        
        <span className="text-sm text-slate-500">
          Page {pageIndex + 1} of {totalPages}
        </span>

        <button 
        onClick={nextPage}
        className="px-5 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700">
          {isLastPage ? "Finish" : "Next"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
