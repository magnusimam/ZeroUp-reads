import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDownloadsPage from '../modules/reading/useDownloadsPage';
import DownloadsHero from '../modules/reading/components/DownloadsHero';
import DownloadsToolbar from '../modules/reading/components/DownloadsToolbar';
import DownloadsEmptyState from '../modules/reading/components/DownloadsEmptyState';
import DownloadBookCard from '../modules/reading/components/DownloadBookCard';
import OfflineTipsCard from '../modules/reading/components/OfflineTipsCard';
import PopularDownloadsSection from '../modules/reading/components/PopularDownloadsSection';
import DownloadsStorageBanner from '../modules/reading/components/DownloadsStorageBanner';

export default function OfflinePage() {
  const {
    activeTab, setActiveTab,
    visibleBooks,
    usedLabel, quotaLabel, usedPercent,
    popularBooks,
  } = useDownloadsPage();

  function scrollToToolbar() {
    document.getElementById('downloads-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-cream)' }}>
      <Navbar />

      <DownloadsHero />

      <div id="downloads-toolbar" className="bg-white border-b border-[var(--hero-border)]">
        <DownloadsToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          usedLabel={usedLabel}
          quotaLabel={quotaLabel}
          usedPercent={usedPercent}
          onManageStorage={scrollToToolbar}
        />
      </div>

      <main className="max-w-content mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-stretch">
          {visibleBooks.length === 0 ? (
            <DownloadsEmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
              {visibleBooks.map(book => <DownloadBookCard key={book.id} book={book} />)}
            </div>
          )}

          <OfflineTipsCard />
        </div>

        <PopularDownloadsSection books={popularBooks} />

        <DownloadsStorageBanner onManageStorage={scrollToToolbar} />
      </main>

      <Footer />
    </div>
  );
}
