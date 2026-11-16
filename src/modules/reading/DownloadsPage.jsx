import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useDownloadsPage from './useDownloadsPage';
import DownloadsHero from './components/DownloadsHero';
import DownloadsToolbar from './components/DownloadsToolbar';
import DownloadsEmptyState from './components/DownloadsEmptyState';
import DownloadBookCard from './components/DownloadBookCard';
import OfflineTipsCard from './components/OfflineTipsCard';
import PopularDownloadsSection from './components/PopularDownloadsSection';
import DownloadsStorageBanner from './components/DownloadsStorageBanner';

// Single My Downloads page (/downloads; /offline redirects here). Downloads
// are per-device (offlineService/localStorage), so there's no login gate —
// a signed-out reader on a shared tablet still sees what's saved on it.
export default function DownloadsPage() {
  const {
    activeTab, setActiveTab,
    visibleBooks,
    usedLabel, quotaLabel, usedPercent,
    popularBooks, recommendedBookId,
  } = useDownloadsPage();

  function scrollToToolbar() {
    document.getElementById('downloads-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FBFCFF' }}>
      <Navbar />

      <DownloadsHero />

      <div id="downloads-toolbar">
        <DownloadsToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          usedLabel={usedLabel}
          quotaLabel={quotaLabel}
          usedPercent={usedPercent}
          onManageStorage={scrollToToolbar}
        />
      </div>

      <main className="max-w-content mx-auto w-full px-4 sm:px-6 pb-12 flex flex-col gap-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-stretch">
          {visibleBooks.length === 0 ? (
            <DownloadsEmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
              {visibleBooks.map(book => <DownloadBookCard key={book.id} book={book} />)}
            </div>
          )}

          <OfflineTipsCard />
        </div>

        <PopularDownloadsSection books={popularBooks} recommendedBookId={recommendedBookId} />

        <DownloadsStorageBanner onManageStorage={scrollToToolbar} />
      </main>

      <Footer />
    </div>
  );
}
