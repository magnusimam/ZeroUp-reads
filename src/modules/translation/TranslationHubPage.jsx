import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import * as translationRequestService from '../books/translationRequestService';
import * as translationService from './translationService';
import { ROLES, hasRole } from '../../config/roles';

const STATUS_BADGE = {
  in_progress: 'bg-slate-100 text-slate-600',
  submitted: 'bg-sky-100 text-sky-700',
  approved: 'bg-teal-100 text-teal-700',
  rejected: 'bg-red-100 text-red-600',
};

const STATUS_LABEL = {
  in_progress: 'In Progress',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected — needs revision',
};

export default function TranslationHubPage() {
  const { user } = useAuth();
  const [pendingRequests] = useState(() => translationRequestService.getPendingRequests());
  const [drafts] = useState(() => translationService.getDrafts());

  const isReviewer = hasRole(user, [ROLES.EDITOR, ROLES.ADMINISTRATOR]);
  const myDrafts = drafts.filter((d) => d.translatorId === user.id);
  const reviewQueue = drafts.filter((d) => d.status === 'submitted');

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Translation Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Pick up a request, translate side-by-side, and submit for review.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              Open Requests
              <span className="ml-2 text-sm font-normal text-slate-400">({pendingRequests.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Readers asked for these — pick one up to start translating.</p>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">No open requests right now.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/translate/${request.bookId}/${request.language}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">{request.bookTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Requested in {request.language}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 shrink-0">Start translating →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              My Drafts
              <span className="ml-2 text-sm font-normal text-slate-400">({myDrafts.length})</span>
            </h2>
          </div>
          {myDrafts.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">No drafts yet — pick up an open request above.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  to={`/translate/${draft.bookId}/${draft.targetLanguage}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">{draft.bookTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{draft.sourceLanguage} → {draft.targetLanguage}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[draft.status]}`}>
                    {STATUS_LABEL[draft.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {isReviewer && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">
                Review Queue
                <span className="ml-2 text-sm font-normal text-slate-400">({reviewQueue.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Translations submitted and waiting on a human review.</p>
            </div>
            {reviewQueue.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">Nothing waiting on review right now.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviewQueue.map((draft) => (
                  <Link
                    key={draft.id}
                    to={`/translate/${draft.bookId}/${draft.targetLanguage}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{draft.bookTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5">by {draft.translatorName} · {draft.sourceLanguage} → {draft.targetLanguage}</p>
                    </div>
                    <span className="text-xs font-semibold text-teal-600 shrink-0">Review →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
