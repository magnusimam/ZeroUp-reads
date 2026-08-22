import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import * as publishingService from './publishingService';
import { STATUS, STATUS_LABELS, STATUS_BADGE_CLASSES } from './publishingConfig';
import { ROLES, hasRole } from '../../config/roles';

function SubmissionRow({ submission }) {
  return (
    <Link
      to={`/publishing/${submission.id}`}
      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{submission.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          by {submission.authorName} · {submission.category} · {submission.language}
        </p>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE_CLASSES[submission.status]}`}>
        {STATUS_LABELS[submission.status]}
      </span>
    </Link>
  );
}

function SubmissionList({ title, subtitle, submissions, emptyText }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">
          {title}
          <span className="ml-2 text-sm font-normal text-slate-400">({submissions.length})</span>
        </h2>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {submissions.length === 0 ? (
        <p className="px-6 py-8 text-sm text-slate-400 text-center">{emptyText}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {submissions.map((s) => <SubmissionRow key={s.id} submission={s} />)}
        </div>
      )}
    </div>
  );
}

export default function PublishingDashboardPage() {
  const { user } = useAuth();
  // publishingService.getSubmissions() is async (Stage 12: calls the real
  // API when enabled) — loaded via effect rather than a useState
  // initializer, same pattern useUserManagement.js already uses.
  const [submissions, setSubmissions] = useState([]);
  useEffect(() => {
    publishingService.getSubmissions().then(setSubmissions);
  }, []);

  const isReviewer = hasRole(user, [ROLES.EDITOR, ROLES.ADMINISTRATOR]);
  const isPublisher = hasRole(user, [ROLES.PUBLISHER, ROLES.ADMINISTRATOR]);

  const myDrafts = submissions.filter((s) => s.authorId === user.id);
  const reviewQueue = submissions.filter((s) => [STATUS.SUBMITTED, STATUS.REVIEW].includes(s.status));
  const readyToPublish = submissions.filter((s) => s.status === STATUS.APPROVED);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Publishing Studio</h1>
            <p className="text-sm text-slate-500 mt-1">Draft, review and publish books.</p>
          </div>
          <Link
            to="/publishing/new"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + New Draft
          </Link>
        </div>

        <SubmissionList
          title="My Drafts"
          submissions={myDrafts}
          emptyText="You haven't started a draft yet."
        />

        {isReviewer && (
          <SubmissionList
            title="Review Queue"
            subtitle="Submissions waiting on a review."
            submissions={reviewQueue}
            emptyText="Nothing waiting on review right now."
          />
        )}

        {isPublisher && (
          <SubmissionList
            title="Approved — Ready to Publish"
            submissions={readyToPublish}
            emptyText="Nothing approved and waiting to publish yet."
          />
        )}
      </div>
    </div>
  );
}
