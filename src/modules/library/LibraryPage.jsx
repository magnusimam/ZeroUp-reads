import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useLibraryFilters from './useLibraryFilters';
import { preferCoveredBooks, SORT_OPTIONS, describeResults } from './libraryConfig';
import useTranslateRequest from './useTranslateRequest';
import * as booksService from '../books/booksService';
import * as testimonialsService from './testimonialsService';
import * as recommendationsService from './recommendationsService';
import { useAuth } from '../auth/AuthContext';
import useContinueReading from '../reading/useContinueReading';

import LibraryHero from './components/LibraryHero';
import LibrarySidebar from './components/LibrarySidebar';
import ContinueReadingSection from './components/ContinueReadingSection';
import AudienceCards from './components/AudienceCards';
import BestForYouCarousel from './components/BestForYouCarousel';
import AllBooksSection from './components/AllBooksSection';
import EmptySearchState from './components/EmptySearchState';
import TestimonialsSection from './components/TestimonialsSection';
import OrderCTA from './components/OrderCTA';
import LibraryFeatureHighlights from './components/LibraryFeatureHighlights';
import LibraryFooter from './components/LibraryFooter';
import TranslateRequestModal from './components/TranslateRequestModal';

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  // 'all' — plus the old 'story' / 'educational' values from before the two
  // sections merged, so existing links still land on the book list.
  const typeFilter = searchParams.get('type');
  const showAllBooks = ['all', 'story', 'educational'].includes(typeFilter);
  const { user } = useAuth();

  // Re-reads on every mount, so an admin upload/delete is reflected the next
  // time a reader lands on this page — same booksService AdminCMSPage writes to.
  const [books] = useState(() => booksService.getBooks());
  const [testimonials] = useState(() => testimonialsService.getTestimonials());
  const continueReadingBooks = useContinueReading(books);
  const translateRequest = useTranslateRequest();

  // Real, personalized picks for a signed-in reader — null (not []) means
  // "not available", so BestForYouCarousel falls back to the plain,
  // unfiltered catalogue exactly as before (guest browsing, flag off, or
  // the request failed) rather than rendering an empty carousel.
  const [recommendedBooks, setRecommendedBooks] = useState(null);
  useEffect(() => {
    if (!user) {
      setRecommendedBooks(null);
      return;
    }
    let cancelled = false;
    recommendationsService.getRecommendations().then((result) => {
      if (!cancelled && result && result.length > 0) setRecommendedBooks(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const {
    search, setSearch,
    activeCategory, toggleCategory,
    language, setLanguage, languageOptions,
    level, setLevel, levelOptions,
    ageGroup, setAgeGroup, ageGroupOptions,
    offlineOnly, setOfflineOnly,
    translatedOnly, setTranslatedOnly,
    sort, setSort,
    clearFilters,
    filtered,
    hasActiveFilters,
  } = useLibraryFilters(books);

  useEffect(() => {
    if (showAllBooks) {
      document.getElementById('all-books')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAllBooks]);

  // Hands off the homepage's search bar, language/category chips and
  // reading-level cards, Popular Books "View all" and Explore → Popular Books
  // (?search= / ?language= / ?level= / ?category= / ?sort=) into these same
  // filters instead of each entry point re-implementing filter logic.
  // Re-runs whenever the address changes (not just on first load), so a
  // link clicked while already on the Library still applies. The reader
  // asked for something specific, so the results are scrolled into view
  // first — not the header, "Keep Going" or the Featured picks.
  const queryKey = searchParams.toString();
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qLanguage = searchParams.get('language');
    const qLevel = searchParams.get('level');
    const qCategory = searchParams.get('category');
    const qSort = searchParams.get('sort');
    if (!qSearch && !qLanguage && !qLevel && !qCategory && !qSort) return undefined;

    clearFilters();
    setSearch(qSearch || '');
    if (qLanguage) setLanguage(qLanguage);
    if (qLevel) setLevel(qLevel);
    if (qCategory) toggleCategory(qCategory);
    if (qSort && SORT_OPTIONS.some(o => o.value === qSort)) setSort(qSort);

    const timer = setTimeout(() => {
      document.getElementById('all-books')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const noSearchResults = Boolean(search.trim()) && filtered.length === 0;

  // Featured Books and All Books prefer titles with a real cover photo over
  // the plain color+icon placeholder — most of the catalogue has no cover art
  // yet, and these are the sections readers see by default. Skipped once a
  // search/filter is active (hasActiveFilters), or when the reader asked for
  // the full list, since then they want the true matching results, not a
  // cover-biased subset.
  const featuredBooks = preferCoveredBooks(recommendedBooks || books);
  const allBooksForDisplay = hasActiveFilters || showAllBooks ? filtered : preferCoveredBooks(filtered);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-cream)' }}>
      <Navbar />

      <LibraryHero
        activeCategory={activeCategory}
        onToggleCategory={toggleCategory}
        search={search}
        onSearchChange={setSearch}
        language={language}
        setLanguage={setLanguage}
        languageOptions={languageOptions}
        level={level}
        setLevel={setLevel}
        levelOptions={levelOptions}
        ageGroup={ageGroup}
        setAgeGroup={setAgeGroup}
        ageGroupOptions={ageGroupOptions}
        offlineOnly={offlineOnly}
        setOfflineOnly={setOfflineOnly}
        translatedOnly={translatedOnly}
        setTranslatedOnly={setTranslatedOnly}
        sort={sort}
        setSort={setSort}
        onClearFilters={clearFilters}
      />

      {/* Returning readers: "pick up where you left off" comes first, right
          under the header (renders nothing if no book is in progress).
          While a search/filter is active the results take the top spot
          instead, so these step aside (they're back once filters clear). */}
      {user && !hasActiveFilters && (
        <ContinueReadingSection
          userName={user.name}
          books={continueReadingBooks}
          onTranslateRequest={translateRequest.open}
        />
      )}

      {!hasActiveFilters && <AudienceCards />}

      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
        <LibrarySidebar
          language={language} setLanguage={setLanguage} languageOptions={languageOptions}
          ageGroup={ageGroup} setAgeGroup={setAgeGroup} ageGroupOptions={ageGroupOptions}
          activeCategory={activeCategory} onSelectCategory={toggleCategory}
          level={level} setLevel={setLevel} levelOptions={levelOptions}
          offlineOnly={offlineOnly} setOfflineOnly={setOfflineOnly}
          translatedOnly={translatedOnly} setTranslatedOnly={setTranslatedOnly}
          onClear={clearFilters}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          {!hasActiveFilters && (
            <BestForYouCarousel
              key={recommendedBooks ? 'recommended' : 'catalogue'}
              books={featuredBooks}
            />
          )}

          {noSearchResults ? (
            <EmptySearchState />
          ) : (
            <AllBooksSection
              books={allBooksForDisplay}
              viewAll={hasActiveFilters || showAllBooks}
              resultsTitle={hasActiveFilters ? describeResults({ search, language, level, category: activeCategory, sort }) : null}
              onClearFilters={() => { clearFilters(); setSearch(''); }}
              onTranslateRequest={translateRequest.open}
            />
          )}
        </div>
      </div>

      <TestimonialsSection testimonials={testimonials} books={books} />

      <OrderCTA />

      <LibraryFeatureHighlights />

      <LibraryFooter />

      <TranslateRequestModal
        book={translateRequest.book}
        language={translateRequest.language}
        onLanguageChange={translateRequest.setLanguage}
        submitting={translateRequest.submitting}
        onCancel={translateRequest.close}
        onSubmit={translateRequest.submit}
      />
    </div>
  );
}
