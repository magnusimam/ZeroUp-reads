import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useLibraryFilters from './useLibraryFilters';
import useTranslateRequest from './useTranslateRequest';
import * as booksService from '../books/booksService';
import * as testimonialsService from './testimonialsService';
import { useAuth } from '../auth/AuthContext';
import useContinueReading from '../reading/useContinueReading';

import LibraryHeader from './components/LibraryHeader';
import LibraryHero from './components/LibraryHero';
import ContinueReadingSection from './components/ContinueReadingSection';
import BestForYouCarousel from './components/BestForYouCarousel';
import StoryBooksSection from './components/StoryBooksSection';
import EducationalBooksSection from './components/EducationalBooksSection';
import TestimonialsSection from './components/TestimonialsSection';
import OrderCTA from './components/OrderCTA';
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

  const {
    search, setSearch,
    activeCategory, toggleCategory,
    language, setLanguage, languageOptions,
    level, setLevel, levelOptions,
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

  return (
    <div className="min-h-screen flex flex-col bg-cream font-nunito-sans">
      <LibraryHeader />

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
        sort={sort}
        setSort={setSort}
        onClearFilters={clearFilters}
      />

      {!hasActiveFilters && <BestForYouCarousel books={books} />}

      <StoryBooksSection
        books={storyBooks}
        viewAll={hasActiveFilters || typeFilter === 'story'}
        onTranslateRequest={translateRequest.open}
      />

      <EducationalBooksSection
        books={educationalBooks}
        viewAll={hasActiveFilters || typeFilter === 'educational'}
        onTranslateRequest={translateRequest.open}
      />

      <TestimonialsSection testimonials={testimonials} books={books} />

      {user && (
        <ContinueReadingSection
          userName={user.name}
          books={continueReadingBooks}
          onTranslateRequest={translateRequest.open}
        />
      )}

      <OrderCTA />

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
