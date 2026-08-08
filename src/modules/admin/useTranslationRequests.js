import { useState } from 'react';
import * as translationRequestService from '../books/translationRequestService';

// Approval queue for reader-submitted translation requests (LibraryPage's
// "🌍 Translate" button) — separate from useBookUpload's own translate modal,
// which still translates instantly and is left untouched.
export default function useTranslationRequests() {
  const [pendingRequests, setPendingRequests] = useState(() => translationRequestService.getPendingRequests());
  const [requestMSG, setRequestMSG] = useState('');

  function refresh() {
    setPendingRequests(translationRequestService.getPendingRequests());
  }

  function approve(requestId) {
    const request = pendingRequests.find((r) => r.id === requestId);
    translationRequestService.approveRequest(requestId);
    refresh();
    setRequestMSG(`Approved — "${request?.bookTitle}" (${request?.language}) is now live in the library!`);
    setTimeout(() => setRequestMSG(''), 4000);
  }

  function reject(requestId) {
    const request = pendingRequests.find((r) => r.id === requestId);
    translationRequestService.rejectRequest(requestId);
    refresh();
    setRequestMSG(`Declined the request for "${request?.bookTitle}" (${request?.language}).`);
    setTimeout(() => setRequestMSG(''), 4000);
  }

  return { pendingRequests, requestMSG, approve, reject };
}
