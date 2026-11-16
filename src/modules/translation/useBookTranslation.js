import { useEffect, useState } from 'react';
import * as eventBus from '../../utils/eventBus';
import * as machineTranslationService from './machineTranslationService';

// The reader's chosen Translate language, kept in sync across every
// component that shows it (navbar button, reader menu, page text) via the
// event bus rather than a context provider.
export function useTranslateTarget() {
  const [target, setTarget] = useState(() => machineTranslationService.getTargetLanguage());
  useEffect(
    () => eventBus.on('book.translation.target.changed', () => setTarget(machineTranslationService.getTargetLanguage())),
    [],
  );
  return target;
}

// Machine-translates one piece of book text into the reader's chosen
// language. `sourceLanguageName` is the book's own language — choosing that
// same language means "no translation needed".
// status: 'off' | 'loading' | 'done' | 'error'
export default function useBookTranslation(text, sourceLanguageName) {
  const target = useTranslateTarget();
  const [result, setResult] = useState({ key: null, text: null, status: 'off' });
  const [showOriginal, setShowOriginal] = useState(false);

  const active = Boolean(target && text && target.name !== sourceLanguageName);
  const key = active ? `${target.code}:${text}` : null;

  useEffect(() => { setShowOriginal(false); }, [key]);

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    setResult({ key, text: null, status: 'loading' });
    machineTranslationService.translateText(text, target.code)
      .then(t => { if (!cancelled) setResult({ key, text: t, status: 'done' }); })
      .catch(() => { if (!cancelled) setResult({ key, text: null, status: 'error' }); });
    return () => { cancelled = true; };
  }, [key, text, target]);

  const status = !active ? 'off' : result.key === key ? result.status : 'loading';
  const translated = status === 'done' && !showOriginal;

  return {
    target: active ? target : null,
    status,
    displayText: translated ? result.text : text,
    translated,
    showOriginal,
    toggleOriginal: () => setShowOriginal(v => !v),
  };
}
