import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as statsService from './statsService';
import { computeTotal, computePieGradient } from './pieChart';

// Route-level gating (RequireRole, App.js) already ensures only an
// administrator ever reaches this component — no inline check needed here.
export default function AnalyticsPage() {
  // Starts from the synchronous local mirror (identical to the old
  // behavior) so the page never renders empty, then swaps in real numbers
  // once (if) the API call resolves — same "local copy first, upgrade in
  // place" posture as the rest of the realXApi domains, just via component
  // state instead of a localStorage cache since this page is the only
  // consumer.
  const [stats, setStats] = useState(() => statsService.getStats());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    statsService
      .getStatsFromApi()
      .then((apiStats) => {
        if (!cancelled) setStats(apiStats);
      })
      .catch(() => {
        // Flag off, no token, or the request failed — the local mirror set
        // above stays as-is.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxLangReads = Math.max(...stats.byLanguage.map((l) => l.reads));

  const levelColors = {
    Beginner: 'bg-teal-500',
    Intermediate: 'bg-amber-500',
    Advanced: 'bg-purple-500',
  };

  const levelColorHex = {
    Beginner: '#14b8a6',
    Intermediate: '#f59e0b',
    Advanced: '#a855f7',
  };

  const totalLevels = computeTotal(stats.byLevel);
  const pieGradient = computePieGradient(stats.byLevel, levelColorHex);

  return (
    <div className='bg-slate-50 min-h-screen flex flex-col'>
      <Navbar />

      <div className='max-w-5xl mx-auto w-full px-6 py-10 flex-1'>
        <div className='mb-8 flex items-center gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900'>Analytics Dashboard</h1>
            <p className='text-sm text-slate-500 mt-1'>Platform usage overview</p>
          </div>
          {loading && (
            <span className='w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin' aria-label='Refreshing analytics' />
          )}
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-2xl border border-slate-200 p-5'>
            <p className='text-3xl font-bold text-slate-900'>{stats.totalUsers.toLocaleString()}</p>
            <p className='text-xs text-slate-500 mt-1'>Total Users</p>
          </div>
          <div className='bg-white rounded-2xl border border-slate-200 p-5'>
            <p className='text-3xl font-bold text-slate-900'>{stats.totalBooks}</p>
            <p className='text-xs text-slate-500 mt-1'>Total Books</p>
          </div>
          <div className='bg-white rounded-2xl border border-slate-200 p-5'>
            <p className='text-3xl font-bold text-teal-600'>{stats.booksReadThisWeek}</p>
            <p className='text-xs text-slate-500 mt-1'>Read This Week</p>
          </div>
          <div className='bg-white rounded-2xl border border-slate-200 p-5'>
            <p className='text-3xl font-bold text-amber-600'>{stats.completionsThisWeek}</p>
            <p className='text-xs text-slate-500 mt-1'>Completed This Week</p>
          </div>
        </div>

        <div className='grid sm:grid-cols-2 gap-6 mb-8'>
          <div className='bg-white rounded-2xl border border-slate-200 p-6'>
            <h2 className='font-bold text-slate-900 mb-5'>Reads by Language</h2>
            <div className='space-y-4'>
              {stats.byLanguage.map((lang) => (
                <div key={lang.language}>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='font-medium text-slate-700'>{lang.language}</span>
                    <span className='text-slate-500'>{lang.reads.toLocaleString()}</span>
                  </div>
                  <div className='h-2.5 bg-slate-50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-teal-500 rounded-full transition-all duration-500'
                      style={{ width: `${(lang.reads / maxLangReads) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-2xl border border-slate-200 p-6'>
            <h2 className='font-bold text-slate-900 mb-5'>Reading Level Distribution</h2>
            <div className='flex items-center gap-6'>
              <div
                className='w-32 h-32 rounded-full flex-shrink-0'
                style={{ background: pieGradient }}
              />

              <div className='space-y-2'>
                {stats.byLevel.map((level) => (
                  <div key={level.level} className='flex items-center gap-2'>
                    <span className={`w-3 h-3 rounded-full ${levelColors[level.level]}`} />
                    <span className='text-sm text-slate-700'>{level.level}</span>
                    <span className='text-sm text-slate-400'>
                      {Math.round((level.value / totalLevels) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100'>
            <h2 className='font-bold text-slate-900'>Most Read Books</h2>
          </div>
          <div className='divide-y divide-slate-100'>
            {stats.topBooks.map((book, i) => (
              <div key={book.id} className='flex items-center gap-4 py-4 px-6'>
                <span className='text-lg font-bold text-slate-300 w-6'>{i + 1}</span>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-sm text-slate-900 truncate'>{book.title}</p>
                  <p className='text-xs text-slate-500'>{book.author}</p>
                </div>
                <span className='text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0'>
                  {book.language}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
