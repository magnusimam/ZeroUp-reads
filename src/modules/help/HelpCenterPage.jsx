import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useHelpCenter from './useHelpCenter';
import HelpHero from './components/HelpHero';
import HelpTopicsGrid from './components/HelpTopicsGrid';
import FAQAccordion from './components/FAQAccordion';
import StillNeedHelpCard from './components/StillNeedHelpCard';
import SupportHoursCard from './components/SupportHoursCard';
import HelpCTABanner from './components/HelpCTABanner';

function scrollToFaq() {
  document.getElementById('help-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function HelpCenterPage() {
  const {
    query, setQuery, search,
    activeTopic, activeTopicTitle, selectTopic, clearFilters,
    visibleFaqs, hiddenCount,
    showAll, setShowAll,
  } = useHelpCenter();

  const filterLabel = activeTopic ? activeTopicTitle : query.trim() ? `"${query.trim()}"` : '';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FEFEFE' }}>
      <Navbar />

      <HelpHero
        query={query}
        onQueryChange={setQuery}
        onSearch={text => { search(text); scrollToFaq(); }}
      />

      <main className="max-w-content mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-8">
        <HelpTopicsGrid
          activeTopic={activeTopic}
          onSelectTopic={id => { selectTopic(id); scrollToFaq(); }}
          onViewAll={() => { clearFilters(); setShowAll(true); scrollToFaq(); }}
        />

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 items-start">
          <FAQAccordion
            items={visibleFaqs}
            hiddenCount={hiddenCount}
            showAll={showAll}
            onToggleShowAll={() => setShowAll(s => !s)}
            filterLabel={filterLabel}
            onClearFilter={clearFilters}
          />

          <div className="flex flex-col gap-5">
            <StillNeedHelpCard />
            <SupportHoursCard />
          </div>
        </div>

        <HelpCTABanner />
      </main>

      {/* Village scene + "More stories. More languages. A brighter Africa." from the design mockup. */}
      <img
        src="/images/help/help-village-strip.jpg"
        alt="More stories. More languages. A brighter Africa."
        className="w-full h-[110px] sm:h-[140px] object-cover"
      />

      <Footer />
    </div>
  );
}
