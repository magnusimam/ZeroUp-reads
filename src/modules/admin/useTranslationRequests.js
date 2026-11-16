import { useCallback, useEffect, useState } from 'react';
import * as translationRequestService from '../books/translationRequestService';

// Approval queue for reader-submitted translation requests (the Library/book
// page "🌍 Translate" button). Accepting hands a request to translators in
// the Translation Workspace — it doesn't publish anything by itself. Separate
// from useBookUpload's own translate modal, which still translates instantly.
export default function useTranslationRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestMSG, setRequestMSG] = useState('');

  const refresh = useCallback(async () => {
    setPendingRequests(await translationRequestService.getPendingRequests());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function flash(message) {
    setRequestMSG(message);
    setTimeout(() => setRequestMSG(''), 4000);
  }

  async function act(requestId, action, successMessage) {
    const request = pendingRequests.find((r) => r.id === requestId);
    const result = await action(requestId);
    await refresh();
    flash(result.success ? successMessage(request) : result.message);
  }

  function accept(requestId) {
    return act(requestId, translationRequestService.acceptRequest,
      (r) => `Accepted — "${r?.bookTitle}" (${r?.language}) is now open for translators.`);
  }

  function reject(requestId) {
    return act(requestId, translationRequestService.rejectRequest,
      (r) => `Declined the request for "${r?.bookTitle}" (${r?.language}).`);
  }

  return { pendingRequests, requestMSG, accept, reject };
}
