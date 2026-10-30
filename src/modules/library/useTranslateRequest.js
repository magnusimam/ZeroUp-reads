import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as translationRequestService from '../books/translationRequestService';

// Reader-facing "request a translation" flow — separate from AdminCMSPage's
// useBookUpload.js, which still does its own instant translateBook() call
// unchanged. This one only ever queues a request for admin approval, and
// needs a signed-in reader so every request is tied to an account (the
// backend's POST /translations/requests requires auth).
export default function useTranslateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [book, setBook] = useState(null);
  const [language, setLanguage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function open(targetBook) {
    if (!user) {
      toast?.addToast('Please sign in to request a translation.', 'info');
      navigate('/login');
      return;
    }
    setBook(targetBook);
    setLanguage('');
  }

  function close() {
    setBook(null);
    setLanguage('');
    setSubmitting(false);
  }

  async function submit() {
    if (!book || !language) return;
    setSubmitting(true);

    const result = await translationRequestService.requestTranslation(book.id, language, user?.id);

    if (result.success) {
      toast?.addToast(`Sent to our admin team for approval — we'll add ${book.title} in ${language} soon! 🎉`, 'success');
    } else if (result.duplicate) {
      toast?.addToast(`A request for ${book.title} in ${language} is already waiting on our team.`, 'info');
    } else {
      toast?.addToast(result.message || 'Could not send your request. Please try again.', 'error');
    }
    close();
  }

  return { book, language, setLanguage, submitting, open, close, submit };
}
