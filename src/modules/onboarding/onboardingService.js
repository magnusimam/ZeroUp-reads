import * as eventBus from '../../utils/eventBus';
import * as settingsService from '../settings/settingsService';

const ONBOARDING_KEY = 'zeroup_onboarding';

const DEFAULT_STATE = {
  completed: false,
  languages: [],
  ageGroupKey: '',
  level: '',
  interests: [],
  completedAt: null,
};

function readState() {
  const raw = localStorage.getItem(ONBOARDING_KEY);
  return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
}

export function isComplete() {
  return readState().completed;
}

export function getPreferences() {
  return readState();
}

// Persists the wizard's answers and, since Settings already owns "preferred
// reading language" (settingsService.js), feeds the first chosen language
// into it too — so Settings reflects the onboarding choice instead of the
// two staying disconnected.
export function complete({ languages, ageGroupKey, level, interests }) {
  const state = {
    completed: true,
    languages,
    ageGroupKey,
    level,
    interests,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));

  if (languages?.[0]) {
    settingsService.saveSettings({ preferredLanguage: languages[0] });
  }

  eventBus.emit('onboarding.completed', state);
  return state;
}
