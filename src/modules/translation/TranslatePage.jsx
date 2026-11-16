import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';
import useTranslatePage from './useTranslatePage';
import useTranslateRequest from '../library/useTranslateRequest';
import TranslateHero from './components/TranslateHero';
import TranslateWizard from './components/TranslateWizard';
import { HowItWorksSection, AboutTranslationNote, HelpImproveSection, TranslateFAQSection } from './components/TranslateInfoSections';
import TranslateRequestModal from '../library/components/TranslateRequestModal';

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Public "Translate a Story" page (/translate) — the navbar's Translate a
// Story button lands here. Interim machine translation now; the staff
// translator workspace (human review → publish) lives at /translator.
export default function TranslatePage() {
  const page = useTranslatePage();
  const translateRequest = useTranslateRequest();
  const toast = useToast();

  function requestHuman() {
    if (page.book) {
      translateRequest.open(page.book);
      return;
    }
    toast?.addToast('Pick a story first, then request a translation for it.', 'info');
    scrollTo('translate-start');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-cream)' }}>
      <Navbar />

      <TranslateHero onStart={() => scrollTo('translate-start')} onLearn={() => scrollTo('translate-how')} />

      <main className="max-w-content mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-14">
        <TranslateWizard page={page} />
        <HowItWorksSection onStart={() => scrollTo('translate-start')} />
        <AboutTranslationNote />
        <HelpImproveSection onRequestHuman={requestHuman} />
        <TranslateFAQSection />
      </main>

      <Footer />

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
