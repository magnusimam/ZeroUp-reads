import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as translationRequestService from '../books/translationRequestService';

// Reader-facing "request a translation" flow — separate from AdminCMSPage's
// useBookUpload.js, which still does its own instant translateBook() call
// unchanged. This one only ever queues a request for admin approval.
export default function useTranslateRequest() {
  const { user } = useAuth();
  const toast = useToast();
  const [book, setBook] = useState(null);
  const [language, setLanguage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function open(targetBook) {
    setBook(targetBook);
    setLanguage('');
  }

  function close() {
    setBook(null);
    setLanguage('');
    setSubmitting(false);
  }

  function submit() {
    if (!book || !language) return;
    setSubmitting(true);

    const request = translationRequestService.requestTranslation(book.id, language, user?.id);

    if (request) {
      toast?.addToast(`Sent to our admin team for approval — we'll add ${book.title} in ${language} soon! 🎉`, 'success');
    } else {
      toast?.addToast(`A request for ${book.title} in ${language} is already waiting on admin approval.`, 'info');
    }
    close();
  }

  return { book, language, setLanguage, submitting, open, close, submit };
}
