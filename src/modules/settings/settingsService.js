import * as eventBus from '../../utils/eventBus';

const SETTINGS_KEY = 'zeroup_reader_settings';

const DEFAULT_SETTINGS = {
  preferredLanguage: '',
  readerFontSize: 18,
};

export function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  const merged = { ...getSettings(), ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  eventBus.emit('settings.updated', merged);
  return merged;
}
