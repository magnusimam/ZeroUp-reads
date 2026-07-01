import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MOCK_BOOKS } from '../utils/mockData';

const LANGUAGES = ['ALL', 'English', 'Swahili', 'Yoruba', 'Zulu', 'French'];
const LEVELS = ['ALL', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = ['Featured', 'Most Read', 'Most Liked', 'New Arrivals'];
const BATCH_SIZE = 6;

function BookCard({ book }) {
  const COVER_GRADIENTS = {
    English: 'from-teal-500 via-teal-600  to-slate-800',
    Swahili: 'from-blue-500 via-blue-600 to-slate-800',
    Yoruba: 'from-amber-500 via-orange-600 to-slate-800',
    Zulu: 'from-green-500 via-green-600 to-slate-800',
    French: 'from-purple-500 via-purple-600 to-slate-800',
  };
  const gradient = COVER_GRADIENTS[book.language] || 'from-teal-500 to-slate-800';

  return (
    <Link
      to={`/read/${book.id}`}
      className='bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 transition-all duration-200 group'
    >
      {/* COVER - BIG ILLUSTRATED STYLE*/}
      <div className={`relative h-52 bg-gradient-to-br ${gradient}`}>

        {/* -- language, level, banner at bottom of cover--*/}
        <div className='absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm px-3 py-2'>
        <p className='text-white text-xs font-bold tracking-wide uppercase'>
          {book.language} . {book.level}
        </p>
        </div>

        {/*-- verified badge top-right--*/}
        <div className='absolute top-2 right-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1'>
          Verified
        </div>
      </div> 

      {/*--card info--*/}
      <div className='p-4'>
        <h3 className='font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-600 transition-colors'>
          {book.title}
        </h3>
        <p className='text-xs text-slate-500 mt-1'>{book.author}</p>


        {/*-- read count--*/}
        <div className='flex items-center justify-between mt-3'>
          <span className='text-xs text-slate-400'>
            📖 {book.totalPages} pages
          </span>
          <span className='text-xs text-slate-400 font-medium'>
            {Math.floor(Math.random() * 900 + 100)}k reads
          </span>
        </div>
      </div>
      </Link>
  );
}

//FILTER PANEL - 
function FilterPanel({ language, setLanguage, level, setLevel, sort, setSort, onClose, onClear}) {
  const [activeTab, setActiveTab] = useState('language');

  const tabs = [
    { id: 'language', label: 'languages' },
    { id: 'level',  label:'level' },
    { id: 'sort', label:'sort' }
  ];
  return (
<div className='fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center'>
 {/* backdrop */}
<div

className='absolute inset-0 bg-black/40'
onClick={onClose}
 />

 {/* panel */}
 <div className='relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col'>
  {/*HEADER*/}
  <div className='flex items-center justify-between px-6 py-6 border-b border-slate-100'>
    <h3 className='font-bold text-slate-900 text-lg'> Filter & Sort</h3>
    <button
    onClick={onClear}
    className='text-sm text-teal-600 font-medium'
    >
      Clear all
    </button>
  </div>

  {/* TABS */}
  <div className='flex border-b border-slate-100'>
    {tabs.map(tab => (
      <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 py-3 text-sm font-semibold transition-colors ${
      activeTab === tab.id
      ? 'text-teal-600 border-b-2 border-teal-600'
      : 'text-slate-500'
    }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* TAB CONTENT*/}
  <div className='flex-1 overflow-y-auto p-4'>
    {activeTab === 'language' && (
      <div className='space-y-1'>
        {LANGUAGES.map(l => (
          <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
            language === l
            ? 'bg-teal-50 text-teal-700 font-semibold'
            : 'text-slate-700 hover:bg-slate-50'
          }`}
          >
          {l}
          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            language === l ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
          }`}>
          {language === l && <span className='w-2 h-2 bg-white rounded-full' />}
          </span>
          </button>
        ))}
        </div>
    )}

    {activeTab === 'level' && (
      <div className='space-y-1'>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
              level === l
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div>
              <p className='font-medium'>{l}</p>
              {l === 'Beginner' && <p className='text-xs text-slate-400'>Simple words and sentences</p>}
              {l === 'Intermediate' && <p className='text-xs text-slate-400'>Growing vocabulary</p>}
              {l === 'Advanced' && <p className='text-xs text-slate-400'>Longer, richer stories</p>}
            </div>
            <span
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                level === l ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
              }`}
            >
              {level === l && <span className='w-2 h-2 bg-white rounded-full' />}
            </span>
          </button>
        ))}
      </div>
    )}


    {activeTab === 'sort' && (
      <div className='space-y-1'>
        {SORT_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
              sort === s
                ? 'bg-teal-50 text-teal-700 border-teal-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {s}
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                sort === s ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
              }`}
            >
              {sort === s && <span className='w-2 h-2 bg-white rounded-full' />}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>

  {/*close button */}
  <div className='p-4 border-t border-slate-100'>
    <button
    onClick={onClose}
    className='w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors'
    >
      Show Results
    </button>
  </div>
  </div>
 </div>
  );
}

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [sort, setSort] = useState('Featured');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [showFilter, setShowFilter] = useState(false);

  const activeFilterCount = [
    language !== 'ALL',
    level !== 'ALL',
    sort !== 'Featured',
  ].filter(Boolean).length;

  function clearAll() {
    setLanguage('ALL');
    setLevel('ALL');
    setSort('Featured');
    setVisibleCount(BATCH_SIZE);
  }

  const filtered = useMemo(() => {
    let books = [...MOCK_BOOKS];
    if (search.trim()) {
      books = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (language !== 'ALL') books = books.filter(b => b.language === language);
    if (level !== 'ALL') books = books.filter(b => b.level === level);
    if (sort === 'New Arrivals') books = books.reverse();
    if (sort === 'Most Read') books = books.sort((a, b) => b.totalPages - a.totalPages);
    return books;
  }, [search, language, level, sort]);

  const visibleBooks = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className='bg-slate-50 min-h-screen flex flex-col'>
      <Navbar />

      {/* --HERO HEADER -- */}
      <div className='bg-slate-900 text-white px-6 py-10'>
        <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold'>All Stories</h1>
        <p className='text-slate-400 mt-1 text-sm'>
          {MOCK_BOOKS.length} stories across {LANGUAGES.length - 1} languages
        </p>
      

      {/*  SEARCH BAR  */}
      <div className='mt-5 relative'>
        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'>🛡️</span>
        <input
        type='text'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setVisibleCount(BATCH_SIZE);
        }}
        placeholder='Search Stories...'
        className='w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
        />
      </div>
      </div>
      </div>

      <div className='max-w-4xl mx-auto w-full px-6 py-6 flex-1'>

        {/* FILTER BAR */}
        <div className='flex items-center justify-between mb-5'>
          <p className='text-sm text-slate-500'>
            <span className='font-semibold text-slate-900'>{filtered.length}</span> Stories found
          </p>
          <button
          onClick={() => setShowFilter(true)}
          className='flex items-center gap-2 px-4 py-2 rounded-xl  border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:border-teal-400 hover:text-teal-600 transition-colors'
          >
            <span>🛡️</span>
            Sort/ Filter
         {activeFilterCount > 0 &&(
          <span className='bg-teal-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold'>
            {activeFilterCount}
          </span>
         )}
          </button>
        </div>

        {/* ACTIVE FILTER  */}
        {(language !== 'ALL' || level !== 'ALL' || sort !== 'Featured') && (
          <div className='flex flex-wrap gap-2 mb-5'>
            {language !== 'ALL' && (
              <span className='flex items-center gap-1 bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full'>
                {language}
                <button onClick={() => setLanguage('ALL')} className='ml-1 hover:text-teal-900'>x</button>
              </span>
            )}

            {level !== 'ALL' && (
              <span className='flex items-center gap-1 bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full'>
                {level}
                <button onClick={() => setLevel('ALL')} className='ml-1 hover:text-teal-900'>x</button>
              </span>
            )}
            {sort !== 'Featured' && (
              <span className='flex items-center gap-1 bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full'>
                {sort}
                <button onClick={() => setSort('Featured')} className='ml-1 hover:text-teal-900'>x</button>
              </span>
            )}
            <button
              onClick={clearAll}
              className='text-xs text-slate-500 hover:text-slate-700 underline'
            >
              Clear all
            </button>
          </div>
        )}

          {/* BOOK GRID */}
          {filtered.length === 0 ? (
            <div className='text-center py-20'>
              <p className='text-5xl mb-4'>🛡️</p>
              <p className='text-slate-600 font-semibold text-lg'>No stories found</p>
              <p className='text-slate-400 text-sm mt-1'>Try different keywords or filters</p>
              <button
              onClick={clearAll}
              className='mt-4 text-teal-600 font-medium text-sm hover:underline'
              >
                Clear all filters
              </button>
              </div>
          ) : (
            <>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
              {visibleBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
              
              {hasMore && (
                <div className='text-center mt-8'>
                  <button
                  onClick={() => setVisibleCount(v => v + BATCH_SIZE)}
                  className='px-8 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:border-teal-500 hover:text-teal-600 transition-colors'
                  >
                    Load more ({filtered.length -visibleCount} remaining)
                  </button>
                </div>
              )}
              </>
          )}
          </div>

          {/* filter panel */}
          {showFilter && (
           <FilterPanel
           language={language}
           setLanguage={setLanguage}
           level={level}
           setLevel={setLevel}
           sort={sort}
           setSort={setSort}
           onClose={() => setShowFilter(false)}
           onClear={() => {clearAll(); setShowFilter(false); }}
           />
          )}
            
            
      


      <Footer />
    </div>
  );
}

