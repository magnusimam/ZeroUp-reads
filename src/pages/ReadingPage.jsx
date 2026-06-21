import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function ReadingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
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
            <button className="w-8-h--8 rounded-full border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-100">
              A-
            </button>
            <button className="w-8-h-8 rounded-full border border-slate-300 text-slate-600 text sm font-bold hover:bg-slate-100">
              A+
            </button>
          </div>
        </div>
      </div>

      {/*---BOOK HEADER---*/}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-6 text-center">
        <div className="w-28 h-40 mx-auto mb-5 rounded-lg bg-gradient-to-br from-teal-600 to slate-800 flex items-center justify-center text-3xl">
          📚
        </div>
       
        <h1 className="text-2xl font-bold text-slate-900">
          Book Title Goes Here
        </h1>
        <p className="text-sm text-slate-500 mt-1">by Author name</p>

        <div className="flex gap-2 justify-center mt-3">
          <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">
            Language
          </span>
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            Reading level
          </span>
        </div>
      </div>

      {/*-- CONTENT AREA--*/}
      <div className="max-w-3xl mx-auto px-6 py-8 bg-white rounded-xl border border-slate-200 mb-8">
        <p className="text-lg leading-relaxed text-slate-800">
          This is where the book's content will appear once it's connected
          to real data. For now, this is just placeholder text standing 
          for a page of the story.
        </p>
      </div>

      {/*--PAGE NAVIGATION--*/}
      <div className="max-w-2xl mx-auto px-6 pb-14 flex items-center justify-between">
        <button className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100">
          Previous
        </button>

        
        <span className="text-sm text-slate-500">
          Page 1 of 10
        </span>

        <button className="px-5 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700">
          Next Page
        </button>
      </div>

      <Footer />
    </div>
  );
}
