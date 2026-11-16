import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as booksService from '../books/booksService';
import * as translationService from './translationService';
import { effectiveRole, hasRole, ROLES } from '../../config/roles';
import { TRANSLATION_AUTOSAVE_DELAY_MS } from '../../config/rules';

// State + actions for the side-by-side Translation Workspace
// (/translator/:bookId/:language) — TranslationWorkspacePage stays
// presentational (Separation of Concerns).
export default function useTranslationWorkspace(bookId, language) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const book = booksService.getBook(bookId);
  const actor = useMemo(() => ({ id: user.id, name: user.name, systemRole: effectiveRole(user) }), [user]);

  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [busy, setBusy] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!book) return undefined;
    let cancelled = false;
    setDraft(null);
    setLoadError('');
    translationService.startDraft(book, language, { id: user.id, name: user.name }).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setLoadError(result.message);
        return;
      }
      setDraft(result.draft);
      setParagraphs(result.draft.paragraphs);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, language]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const translatedCount = paragraphs.length - translationService.countUntranslated(paragraphs);
  const total = paragraphs.length;
  const isOwner = draft?.translatorId === user.id;
  const isReviewer = hasRole(user, [ROLES.EDITOR, ROLES.ADMINISTRATOR]);
  const canEdit = Boolean(draft) && isOwner && ['in_progress', 'rejected'].includes(draft.status);
  const canReview = Boolean(draft) && isReviewer && draft.status === 'submitted' && !isOwner;
  const canSubmit = canEdit && total > 0 && translatedCount === total;

  async function save(next) {
    const result = await translationService.autoSaveDraft(draft.id, next);
    if (result.success) {
      setDraft((current) => ({ ...current, lastSavedAt: result.draft.lastSavedAt }));
      setSaveState('saved');
    } else {
      setSaveState('error');
    }
    return result;
  }

  function changeParagraph(index, value) {
    const next = paragraphs.map((p, i) => (i === index ? { ...p, translated: value } : p));
    setParagraphs(next);
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), TRANSLATION_AUTOSAVE_DELAY_MS);
  }

  function changeLanguage(nextLanguage) {
    if (nextLanguage) navigate(`/translator/${bookId}/${nextLanguage}`);
  }

  async function runAction(action, successMessage, successTone = 'success') {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result.success) {
      setDraft(result.draft);
      setParagraphs(result.draft.paragraphs);
      toast?.addToast(successMessage, successTone);
    } else {
      toast?.addToast(result.message || 'Something went wrong. Please try again.', 'error');
    }
    return result;
  }

  async function submit() {
    clearTimeout(saveTimer.current);
    setBusy(true);
    const saved = await save(paragraphs);
    setBusy(false);
    if (!saved.success) {
      toast?.addToast(saved.message || 'Could not save your latest changes.', 'error');
      return;
    }
    await runAction(() => translationService.submitForReview(draft.id, actor), 'Submitted for review 🎉');
  }

  function approve() {
    return runAction(
      () => translationService.approve(draft.id, actor),
      `Approved — "${draft.bookTitle}" (${draft.targetLanguage}) is now live in the library!`
    );
  }

  async function reject() {
    if (!showRejectBox) {
      setShowRejectBox(true);
      return;
    }
    if (!rejectComment.trim()) {
      toast?.addToast('Please explain what needs revision.', 'error');
      return;
    }
    const result = await runAction(
      () => translationService.reject(draft.id, actor, rejectComment.trim()),
      'Sent back to the translator for revision.',
      'info'
    );
    if (result.success) {
      setShowRejectBox(false);
      setRejectComment('');
    }
  }

  function cancelReject() {
    setShowRejectBox(false);
    setRejectComment('');
  }

  return {
    book, draft, loadError, paragraphs,
    translatedCount, total, saveState, busy,
    canEdit, canReview, canSubmit,
    changeParagraph, changeLanguage, submit, approve,
    reject, cancelReject, showRejectBox, rejectComment, setRejectComment,
  };
}
