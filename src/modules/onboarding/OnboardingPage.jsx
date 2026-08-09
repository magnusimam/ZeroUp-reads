import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useOnboarding, { STEP } from './useOnboarding';
import { INTRO_SLIDES, ONBOARDING_LANGUAGES, ONBOARDING_AGE_GROUPS, ONBOARDING_INTERESTS, ONBOARDING_LEVELS } from './onboardingConfig';
import IntroSlide from './components/IntroSlide';
import PreferenceStep from './components/PreferenceStep';
import RecommendationsStep from './components/RecommendationsStep';

// First-run wizard shown once, right after registration (RegisterPage.jsx
// navigates here instead of straight to /dashboard). Collects preferred
// language(s), age group, reading interests and reading level, then hands
// off to a personalized recommendations screen — everything here reuses the
// same taxonomies the rest of the app filters/tags books with, so a chosen
// preference always resolves to real books.
export default function OnboardingPage() {
  const onboarding = useOnboarding();
  const {
    step, totalSteps, next, back, skipIntro,
    languages, toggleLanguage,
    ageGroupKey, setAgeGroupKey,
    interests, toggleInterest,
    level, setLevel,
    finish,
  } = onboarding;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-nunito-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <AnimatePresence mode="wait">
          {step < STEP.INTRO_END && (
            <IntroSlide
              key={`intro-${step}`}
              slide={INTRO_SLIDES[step]}
              index={step}
              total={INTRO_SLIDES.length}
              isLast={step === INTRO_SLIDES.length - 1}
              onNext={next}
              onSkip={skipIntro}
            />
          )}

          {step === STEP.LANGUAGES && (
            <PreferenceStep
              key="languages"
              emoji="🌍"
              title="Which language(s) do you read in?"
              subtitle="Pick as many as you like."
              options={ONBOARDING_LANGUAGES}
              isSelected={(lang) => languages.includes(lang)}
              onSelect={toggleLanguage}
              onBack={back}
              onNext={next}
              nextDisabled={languages.length === 0}
            />
          )}

          {step === STEP.AGE_GROUP && (
            <PreferenceStep
              key="age-group"
              emoji="🎂"
              title="What's your age group?"
              subtitle="This helps us suggest the right reading level."
              options={ONBOARDING_AGE_GROUPS}
              getKey={(o) => o.key}
              getLabel={(o) => `${o.label} · ${o.ageRange}`}
              getIcon={(o) => o.icon}
              isSelected={(o) => ageGroupKey === o.key}
              onSelect={(o) => { setAgeGroupKey(o.key); if (!level) setLevel(o.libraryLevel); }}
              onBack={back}
              onNext={next}
              nextDisabled={!ageGroupKey}
            />
          )}

          {step === STEP.INTERESTS && (
            <PreferenceStep
              key="interests"
              emoji="💛"
              title="What are you interested in?"
              subtitle="Pick a few topics you'd love to read about."
              options={ONBOARDING_INTERESTS}
              isSelected={(cat) => interests.includes(cat)}
              onSelect={toggleInterest}
              onBack={back}
              onNext={next}
              nextDisabled={interests.length === 0}
            />
          )}

          {step === STEP.LEVEL && (
            <PreferenceStep
              key="level"
              emoji="📖"
              title="What's your reading level?"
              subtitle="We picked one for you — feel free to change it."
              options={ONBOARDING_LEVELS}
              isSelected={(l) => level === l}
              onSelect={setLevel}
              onBack={back}
              onNext={next}
              nextDisabled={!level}
              nextLabel="See my books"
            />
          )}

          {step === STEP.RECOMMENDATIONS && (
            <RecommendationsStep
              key="recommendations"
              languages={languages}
              level={level}
              interests={interests}
              onStartReading={(book) => finish(book ? `/book/${book.id}` : '/library')}
              onGoToDashboard={() => finish('/dashboard')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator across the whole wizard, not just the intro slides */}
      <div className="pb-8 flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-coral' : 'w-1.5 bg-gold/25'}`}
          />
        ))}
      </div>

      <Footer />
    </div>
  );
}
