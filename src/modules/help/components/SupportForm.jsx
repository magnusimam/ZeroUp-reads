import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../context/ToastContext';
import * as helpService from '../helpService';
import { BOOK_LANGUAGES } from '../../../utils/mockData';

const PROBLEM_CATEGORIES = ['Bug', 'Content issue', 'Translation issue', 'Account issue', 'Other'];

const TYPE_META = {
  contact: { icon: '💬', title: 'Contact Support', subtitle: "Have a question? We're happy to help." },
  problem: { icon: '🐞', title: 'Report a Problem', subtitle: 'Tell us what went wrong so we can fix it.' },
  suggestion: { icon: '📚', title: 'Suggest a Book', subtitle: "Know a story we should add? We'd love to hear it." },
  feedback: { icon: '⭐', title: 'Share Feedback', subtitle: "Tell us how we're doing." },
};

const inputClass = 'w-full px-4 py-2.5 rounded-full border-2 border-gold/30 bg-white text-sm font-nunito-sans text-charcoal focus:outline-none focus:border-sky-blue';
const textareaClass = 'w-full px-4 py-3 rounded-2xl border-2 border-gold/30 bg-white text-sm font-nunito-sans text-charcoal focus:outline-none focus:border-sky-blue resize-none';

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-nunito font-bold text-sm text-charcoal/70 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function validate(type, fields) {
  if (type === 'contact' && (!fields.subject?.trim() || !fields.message?.trim())) {
    return 'Please fill in the subject and message.';
  }
  if (type === 'problem' && (!fields.category || !fields.description?.trim())) {
    return 'Please choose a category and describe the problem.';
  }
  if (type === 'suggestion' && (!fields.bookTitle?.trim() || !fields.reason?.trim())) {
    return "Please tell us the book's title and why you're suggesting it.";
  }
  if (type === 'feedback' && !fields.rating) {
    return 'Please choose a rating.';
  }
  return '';
}

// One reusable form for all four Help Center forms (Contact/Report a
// Problem/Suggest a Book/Feedback) — same submit/loading/success/error
// scaffold, only the field set and copy differ per `type`.
export default function SupportForm({ type }) {
  const meta = TYPE_META[type];
  const { user } = useAuth();
  const toast = useToast();
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  function set(name, value) {
    setFields((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate(type, fields);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      const created = helpService.submitTicket(type, fields, user?.id);
      setSubmitting(false);
      setTicket(created);
      toast?.addToast("Thanks — we've got your message!", 'success');
    }, 400);
  }

  if (ticket) {
    return (
      <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10 text-center">
        <span className="text-5xl inline-block mb-3" aria-hidden="true">✅</span>
        <h2 className="font-playfair font-bold text-xl text-cocoa mb-2">Thanks — we've got it!</h2>
        <p className="text-charcoal/60 text-sm">
          Ticket #{ticket.id.slice(-6)} — we'll follow up if a reply is needed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
      <div className="text-center mb-6">
        <span className="text-5xl inline-block mb-2" aria-hidden="true">{meta.icon}</span>
        <h2 className="font-playfair font-bold text-xl text-cocoa">{meta.title}</h2>
        <p className="text-charcoal/60 text-sm mt-1">{meta.subtitle}</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {type === 'contact' && (
          <>
            <FormField label="Subject">
              <input className={inputClass} value={fields.subject || ''} onChange={(e) => set('subject', e.target.value)} placeholder="What's this about?" />
            </FormField>
            <FormField label="Message">
              <textarea className={textareaClass} rows={5} value={fields.message || ''} onChange={(e) => set('message', e.target.value)} placeholder="Tell us more…" />
            </FormField>
          </>
        )}

        {type === 'problem' && (
          <>
            <FormField label="Category">
              <select className={inputClass} value={fields.category || ''} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select a category…</option>
                {PROBLEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Book title (optional)">
              <input className={inputClass} value={fields.bookTitle || ''} onChange={(e) => set('bookTitle', e.target.value)} placeholder="e.g. Anansi the Spider" />
            </FormField>
            <FormField label="Describe the problem">
              <textarea className={textareaClass} rows={5} value={fields.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="What happened?" />
            </FormField>
          </>
        )}

        {type === 'suggestion' && (
          <>
            <FormField label="Book title">
              <input className={inputClass} value={fields.bookTitle || ''} onChange={(e) => set('bookTitle', e.target.value)} />
            </FormField>
            <FormField label="Author (if known)">
              <input className={inputClass} value={fields.bookAuthor || ''} onChange={(e) => set('bookAuthor', e.target.value)} />
            </FormField>
            <FormField label="Language">
              <select className={inputClass} value={fields.language || ''} onChange={(e) => set('language', e.target.value)}>
                <option value="">Select a language…</option>
                {BOOK_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>
            <FormField label="Why should we add it?">
              <textarea className={textareaClass} rows={4} value={fields.reason || ''} onChange={(e) => set('reason', e.target.value)} />
            </FormField>
          </>
        )}

        {type === 'feedback' && (
          <>
            <FormField label="How would you rate ZeroUp Reads?">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => set('rating', n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={fields.rating === n}
                    className={`w-11 h-11 rounded-full text-lg transition-colors ${
                      fields.rating >= n ? 'bg-coral text-white' : 'bg-cream text-charcoal/30 border-2 border-gold/20'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Comments (optional)">
              <textarea className={textareaClass} rows={4} value={fields.comments || ''} onChange={(e) => set('comments', e.target.value)} />
            </FormField>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-6 py-3 rounded-full bg-coral text-white font-nunito font-bold text-sm disabled:opacity-60 hover:scale-105 transition-transform shadow-card"
      >
        {submitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
