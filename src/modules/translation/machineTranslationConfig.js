// Languages a reader can machine-translate a book into with the Translate
// button — a stop-gap until the AI translation pipeline
// (docs/ENGINEERING_BLUEPRINT.md's Translation workflow) ships. `name`
// matches book.language / LANGUAGE_FLAG keys, `code` is the engine's code.
// Kanuri, Tiv, Efik and Pidgin aren't offered: the current engine has no
// reliable support for them (they remain human-translation-only).
export const MACHINE_TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'sw', name: 'Swahili' },
  { code: 'am', name: 'Amharic' },
  { code: 'zu', name: 'Zulu' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
];

export function getMachineLanguage(code) {
  return MACHINE_TRANSLATION_LANGUAGES.find(l => l.code === code) || null;
}

export function getMachineLanguageByName(name) {
  return MACHINE_TRANSLATION_LANGUAGES.find(l => l.name === name) || null;
}
