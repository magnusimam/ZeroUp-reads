import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useLibraryFilters from './useLibraryFilters';
import * as booksService from '../books/booksService';
import * as testimonialsService from './testimonialsService';

import LibraryHeader from './components/LibraryHeader';
import LibraryHero from './components/LibraryHero';
import BestForYouCarousel from './components/BestForYouCarousel';
import StoryBooksSection from './components/StoryBooksSection';
import EducationalBooksSection from './components/EducationalBooksSection';
import TestimonialsSection from './components/TestimonialsSection';
import OrderCTA from './components/OrderCTA';
import LibraryFooter from './components/LibraryFooter';

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type'); // 'story' | 'educational' | null
  const queryParam = searchParams.get('q');
  const langParam = searchParams.get('lang');

  // Re-reads on every mount, so an admin upload/delete is reflected the next
  // time a reader lands on this page — same booksService AdminCMSPage writes to.
  const [books] = useState(() => booksService.getBooks());
  const [testimonials] = useState(() => testimonialsService.getTestimonials());

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

  // Hydrates the search/language filters from the homepage hero's discover
  // bar (?q=&lang=) so a query typed there actually narrows this page's results.
  useEffect(() => {
    if (queryParam) setSearch(queryParam);
    if (langParam) setLanguage(langParam);
  }, [queryParam, langParam, setSearch, setLanguage]);

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

      <StoryBooksSection books={storyBooks} viewAll={hasActiveFilters || typeFilter === 'story'} />

      <EducationalBooksSection books={educationalBooks} viewAll={hasActiveFilters || typeFilter === 'educational'} />

      <TestimonialsSection testimonials={testimonials} books={books} />

      <OrderCTA />

      <LibraryFooter />
    </div>
  );
}
