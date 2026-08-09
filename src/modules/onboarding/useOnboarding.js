import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INTRO_SLIDES } from './onboardingConfig';
import * as onboardingService from './onboardingService';

// Step 0..INTRO_SLIDES.length-1 are the intro slides, then 3 preference
// steps (languages, interests, level — age group is asked alongside
// languages on its own step), then a final recommendations step.
export const STEP = {
  INTRO_END: INTRO_SLIDES.length,
  LANGUAGES: INTRO_SLIDES.length,
  AGE_GROUP: INTRO_SLIDES.length + 1,
  INTERESTS: INTRO_SLIDES.length + 2,
  LEVEL: INTRO_SLIDES.length + 3,
  RECOMMENDATIONS: INTRO_SLIDES.length + 4,
};

export default function useOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [languages, setLanguages] = useState([]);
  const [ageGroupKey, setAgeGroupKey] = useState('');
  const [interests, setInterests] = useState([]);
  const [level, setLevel] = useState('');

  const totalSteps = STEP.RECOMMENDATIONS + 1;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function skipIntro() {
    setStep(STEP.LANGUAGES);
  }

  function toggleLanguage(lang) {
    setLanguages((current) => (
      current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang]
    ));
  }

  function toggleInterest(category) {
    setInterests((current) => (
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category]
    ));
  }

  function finish(destination = '/dashboard') {
    onboardingService.complete({ languages, ageGroupKey, level, interests });
    navigate(destination);
  }

  return {
    step, totalSteps, next, back, skipIntro,
    languages, toggleLanguage,
    ageGroupKey, setAgeGroupKey,
    interests, toggleInterest,
    level, setLevel,
    finish,
  };
}
