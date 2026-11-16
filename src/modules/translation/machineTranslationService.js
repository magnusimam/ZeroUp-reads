import * as eventBus from '../../utils/eventBus';
import { logError } from '../../utils/logger';
import { getMachineLanguage } from './machineTranslationConfig';

// Interim machine translation of book text — what the navbar/reader
// "Translate" button uses until the real AI translation feature exists.
// Every caller goes through translateText(), so swapping the engine below for
// the backend's AI translation endpoint later touches only this file
// (API-First Design).
//
// Engine today: Google Translate's public web endpoint, called from the
// browser. It's unofficial (no key, no SLA, may rate-limit), which is fine
// for a stop-gap but is exactly why it lives behind this one function.

const TARGET_KEY = 'zeroup_book_translate_to';
const CACHE_KEY = 'zeroup_book_translation_cache';
const CACHE_MAX_ENTRIES = 300;
const ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t';

// ── reader's chosen target language ────────────────────────────────────────

export function getTargetLanguage() {
  try {
    return getMachineLanguage(localStorage.getItem(TARGET_KEY));
  } catch {
    return null;
  }
}

// `code` null = translation off (read books in their original language).
export function setTargetLanguage(code) {
  const from = getTargetLanguage()?.code || null;
  try {
    if (code) localStorage.setItem(TARGET_KEY, code);
    else localStorage.removeItem(TARGET_KEY);
  } catch { /* private mode — the choice just won't persist */ }
  eventBus.emit('book.translation.target.changed', { from, to: code || null });
}

// ── cache (also lets a page translated once be re-read offline) ────────────

function hash(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  const keys = Object.keys(cache);
  if (keys.length > CACHE_MAX_ENTRIES) keys.slice(0, keys.length - CACHE_MAX_ENTRIES).forEach(k => delete cache[k]);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota — skip caching */ }
}

// ── translation ────────────────────────────────────────────────────────────

export async function translateText(text, targetCode) {
  if (!text?.trim()) return text;
  const cacheKey = `${targetCode}:${hash(text)}`;
  const cache = readCache();
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch(`${ENDPOINT}&sl=auto&tl=${encodeURIComponent(targetCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: `q=${encodeURIComponent(text)}`,
    });
    if (!res.ok) throw new Error(`Translation service responded ${res.status}`);
    const data = await res.json();
    // Shape: [[["translated chunk", "original chunk", ...], ...], ...]
    const translated = (data?.[0] || []).map(chunk => chunk?.[0] || '').join('');
    if (!translated) throw new Error('Empty translation');

    cache[cacheKey] = translated;
    writeCache(cache);
    return translated;
  } catch (err) {
    logError('book.translation.failed', err, { targetCode });
    throw err;
  }
}
