import * as eventBus from '../../utils/eventBus';
import { logError } from '../../utils/logger';
import { SITE_LANGUAGES, SITE_SOURCE_LANGUAGE } from './siteTranslationConfig';

// Whole-site UI translation, backed by Google's website translator. The app
// has no i18n string catalogue yet, so this translates the rendered page
// rather than swapping message keys — call sites only talk to this service,
// so moving to real per-string translations later doesn't touch the navbar.
//
// Google's widget reads the chosen language from a `googtrans` cookie on page
// load, so changing language = set the cookie + reload. That is far more
// reliable with React re-rendering than poking the widget's hidden <select>.

const SCRIPT_ID = 'google-translate-script';
const CONTAINER_ID = 'google_translate_element';

function readCookieLanguage() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : SITE_SOURCE_LANGUAGE;
}

function writeCookie(value) {
  const expires = value ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  const v = value || '';
  document.cookie = `googtrans=${v}; path=/${expires}`;
  // Google also sets it on the bare domain; clear/set that copy too so the two
  // never disagree (otherwise "back to English" can silently not stick).
  const host = window.location.hostname;
  if (host && host !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    document.cookie = `googtrans=${v}; path=/; domain=.${host}${expires}`;
  }
}

export function getCurrentLanguage() {
  const code = readCookieLanguage();
  return SITE_LANGUAGES.find(l => l.code === code) || SITE_LANGUAGES[0];
}

export function setLanguage(code) {
  const from = getCurrentLanguage().code;
  if (code === from) return;
  writeCookie(code === SITE_SOURCE_LANGUAGE ? null : `/${SITE_SOURCE_LANGUAGE}/${code}`);
  eventBus.emit('site.language.changed', { from, to: code });
  window.location.reload();
}

// Loads the widget once per page. Safe to call from every Navbar mount.
export function initSiteTranslation() {
  if (document.getElementById(SCRIPT_ID)) return;

  if (!document.getElementById(CONTAINER_ID)) {
    const container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }

  window.googleTranslateElementInit = () => {
    try {
      // eslint-disable-next-line no-new
      new window.google.translate.TranslateElement(
        {
          pageLanguage: SITE_SOURCE_LANGUAGE,
          includedLanguages: SITE_LANGUAGES.map(l => l.code).join(','),
          autoDisplay: false,
        },
        CONTAINER_ID,
      );
    } catch (err) {
      logError('site.translation.init_failed', err);
    }
  };

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.onerror = () => logError('site.translation.script_failed', new Error('Could not load Google Translate'));
  document.body.appendChild(script);
}
