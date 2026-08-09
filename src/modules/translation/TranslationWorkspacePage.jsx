import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as booksService from '../books/booksService';
import * as translationService from './translationService';
import { BOOK_LANGUAGES } from '../../utils/mockData';
import { effectiveRole, hasRole, ROLES } from '../../config/roles';

const AUTOSAVE_DELAY_MS = 1500;

export default function TranslationWorkspacePage() {
  const { bookId, language } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const book = booksService.getBook(bookId);
  const actor = useMemo(() => ({ id: user.id, name: user.name, systemRole: effectiveRole(user) }), [user]);

  const [draft, setDraft] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'saving'
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [busy, setBusy] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!book) return;
    const started = translationService.startDraft(book, language, { id: user.id, name: user.name });
    setDraft(started);
    setParagraphs(started.paragraphs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, language]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (!book) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-4xl mb-4">📖</p>
            <h1 className="text-xl font-bold text-slate-900">Book not found</h1>
            <Link to="/translate" className="text-teal-600 font-medium text-sm mt-3 inline-block">
              ← Back to Translation Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) return null;

  const translatedCount = paragraphs.filter((p) => p.translated.trim()).length;
  const total = paragraphs.length;
  const isOwner = draft.translatorId === user.id;
  const isReviewer = hasRole(user, [ROLES.EDITOR, ROLES.ADMINISTRATOR]);
  const canEdit = isOwner && ['in_progress', 'rejected'].includes(draft.status);
  const canReview = isReviewer && draft.status === 'submitted' && !isOwner;

  function handleParagraphChange(index, value) {
    const next = paragraphs.map((p, i) => (i === index ? { ...p, translated: value } : p));
    setParagraphs(next);
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const updated = translationService.autoSaveDraft(draft.id, next);
      if (updated) setDraft(updated);
      setSaveState('saved');
    }, AUTOSAVE_DELAY_MS);
  }

  function handleLanguageChange(nextLanguage) {
    if (nextLanguage) navigate(`/translate/${bookId}/${nextLanguage}`);
  }

  function handleSubmit() {
    clearTimeout(saveTimer.current);
    setBusy(true);
    translationService.autoSaveDraft(draft.id, paragraphs);
    setTimeout(() => {
      const updated = translationService.submitForReview(draft.id, actor);
      setBusy(false);
      if (updated) {
        setDraft(updated);
        toast?.addToast('Submitted for review 🎉', 'success');
      }
    }, 300);
  }

  function handleApprove() {
    setBusy(true);
    setTimeout(() => {
      const updated = translationService.approve(draft.id, actor);
      setBusy(false);
      if (updated) {
        setDraft(updated);
        toast?.addToast(`Approved — "${draft.bookTitle}" (${draft.targetLanguage}) is now live in the library!`, 'success');
      }
    }, 300);
  }

  function handleReject() {
    if (!showRejectBox) {
      setShowRejectBox(true);
      return;
    }
    if (!rejectComment.trim()) {
      toast?.addToast('Please explain what needs revision.', 'error');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const updated = translationService.reject(draft.id, actor, rejectComment.trim());
      setBusy(false);
      setShowRejectBox(false);
      setRejectComment('');
      if (updated) {
        setDraft(updated);
        toast?.addToast('Sent back to the translator for revision.', 'info');
      }
    }, 300);
  }

  const languageOptions = BOOK_LANGUAGES.filter((l) => l !== book.language);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
        <Link to="/translate" className="inline-block text-sm text-teal-600 hover:text-teal-700 mb-6">
          ← Back to Translation Workspace
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{book.title}</h1>
            <p className="text-sm text-slate-500 mt-1">by {book.author} · {book.category}</p>
          </div>
          {canEdit ? (
            <div className="text-right">
              <label className="block text-xs font-medium text-slate-500 mb-1">Translating into</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {languageOptions.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          ) : (
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
              {book.language} → {language}
            </span>
          )}
        </div>

        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{translatedCount} of {total} paragraphs translated</span>
            <span>{canEdit && (saveState === 'saving' ? 'Saving…' : `Saved ✓ ${new Date(draft.lastSavedAt).toLocaleTimeString()}`)}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${total ? (translatedCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* SIDE-BY-SIDE EDITOR */}
          <div className="lg:col-span-2 space-y-4">
            {paragraphs.map((p, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Original ({book.language})
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{p.original}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Translation ({language})
                  </p>
                  <textarea
                    value={p.translated}
                    onChange={(e) => handleParagraphChange(i, e.target.value)}
                    disabled={!canEdit}
                    rows={4}
                    placeholder={canEdit ? 'Type the translation…' : ''}
                    className="w-full text-sm text-slate-700 leading-relaxed border-0 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg disabled:bg-transparent disabled:text-slate-500 resize-none"
                  />
                </div>
              </div>
            ))}

            {/* ACTIONS */}
            {(canEdit || canReview) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {showRejectBox && (
                  <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="What needs revision?"
                    rows={3}
                    className="w-full mb-3 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                )}
                <div className="flex flex-wrap gap-3">
                  {canEdit && (
                    <button
                      onClick={handleSubmit}
                      disabled={busy || translatedCount === 0}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      {busy ? 'Submitting…' : 'Submit for Review'}
                    </button>
                  )}
                  {canReview && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={busy}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        {busy ? 'Working…' : 'Approve'}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={busy}
                        className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        {showRejectBox ? 'Confirm — Reject' : 'Reject'}
                      </button>
                      {showRejectBox && (
                        <button
                          onClick={() => { setShowRejectBox(false); setRejectComment(''); }}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* HISTORY */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
            <h2 className="font-bold text-slate-900 text-sm mb-3">History</h2>
            <div className="space-y-3">
              {[...draft.history].reverse().map((entry, i) => (
                <div key={i} className="text-xs">
                  <p className="font-semibold text-slate-700 capitalize">{entry.status.replace('_', ' ')}</p>
                  <p className="text-slate-400">{entry.byName} · {new Date(entry.at).toLocaleString()}</p>
                  {entry.comment && <p className="text-slate-600 italic mt-1">"{entry.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
