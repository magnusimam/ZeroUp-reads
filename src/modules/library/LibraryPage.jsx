import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useLibraryFilters from './useLibraryFilters';
import { preferCoveredBooks } from './libraryConfig';
import useTranslateRequest from './useTranslateRequest';
import * as booksService from '../books/booksService';
import * as testimonialsService from './testimonialsService';
import * as recommendationsService from './recommendationsService';
import { useAuth } from '../auth/AuthContext';
import useContinueReading from '../reading/useContinueReading';

import LibraryHero from './components/LibraryHero';
import LibrarySidebar from './components/LibrarySidebar';
import ContinueReadingSection from './components/ContinueReadingSection';
import BestForYouCarousel from './components/BestForYouCarousel';
import StoryBooksSection from './components/StoryBooksSection';
import EducationalBooksSection from './components/EducationalBooksSection';
import EmptySearchState from './components/EmptySearchState';
import TestimonialsSection from './components/TestimonialsSection';
import OrderCTA from './components/OrderCTA';
import LibraryFeatureHighlights from './components/LibraryFeatureHighlights';
import LibraryFooter from './components/LibraryFooter';
import TranslateRequestModal from './components/TranslateRequestModal';

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type'); // 'story' | 'educational' | null
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
    const anchorId = typeFilter === 'story' ? 'story-books'
      : typeFilter === 'educational' ? 'educational-books'
      : null;
    if (anchorId) {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [typeFilter]);

  // Hands off the homepage's "Find a story" card (search/language/level/topic
  // selects, popular-language chips, reading-level cards) into these same
  // filters instead of that card re-implementing its own filter logic —
  // one filter implementation, entered from two places.
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qLanguage = searchParams.get('language');
    const qLevel = searchParams.get('level');
    const qCategory = searchParams.get('category');
    if (qSearch) setSearch(qSearch);
    if (qLanguage) setLanguage(qLanguage);
    if (qLevel) setLevel(qLevel);
    if (qCategory) toggleCategory(qCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storyBooks = filtered.filter(b => !b.isEducational);
  const educationalBooks = filtered.filter(b => b.isEducational);
  const noSearchResults = Boolean(search.trim()) && filtered.length === 0;

  // Featured Books, Story Books and Educational Books all prefer titles with
  // a real cover photo over the plain color+icon placeholder — most of the
  // catalogue has no cover art yet, and these are the sections readers see
  // by default. Skipped once a search/filter is active (hasActiveFilters),
  // since a reader filtering wants the true matching results, not a
  // cover-biased subset — same reasoning Featured Books already used.
  const featuredBooks = preferCoveredBooks(recommendedBooks || books);
  const storyBooksForDisplay = hasActiveFilters ? storyBooks : preferCoveredBooks(storyBooks);
  const educationalBooksForDisplay = hasActiveFilters ? educationalBooks : preferCoveredBooks(educationalBooks);

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
            <>
              <StoryBooksSection
                books={storyBooksForDisplay}
                viewAll={hasActiveFilters || typeFilter === 'story'}
                onTranslateRequest={translateRequest.open}
              />

              <EducationalBooksSection
                books={educationalBooksForDisplay}
                viewAll={hasActiveFilters || typeFilter === 'educational'}
                onTranslateRequest={translateRequest.open}
              />
            </>
          )}
        </div>
      </div>

      <TestimonialsSection testimonials={testimonials} books={books} />

      {user && (
        <ContinueReadingSection
          userName={user.name}
          books={continueReadingBooks}
          onTranslateRequest={translateRequest.open}
        />
      )}

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
