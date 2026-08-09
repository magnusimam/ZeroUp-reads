import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as publishingService from './publishingService';
import { ACTIONS_BY_STATUS, STATUS_LABELS, STATUS_BADGE_CLASSES } from './publishingConfig';
import { effectiveRole, hasRole, ROLES } from '../../config/roles';
import StatusTimeline from './components/StatusTimeline';

const ACTION_STYLES = {
  submit: 'bg-teal-600 hover:bg-teal-700 text-white',
  startReview: 'bg-slate-800 hover:bg-slate-900 text-white',
  requestChanges: 'border border-red-200 text-red-600 hover:bg-red-50',
  approve: 'bg-teal-600 hover:bg-teal-700 text-white',
  publish: 'bg-amber-500 hover:bg-amber-600 text-white',
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [submission, setSubmission] = useState(() => publishingService.getSubmission(id));
  const [commentText, setCommentText] = useState('');
  const [changeComment, setChangeComment] = useState('');
  const [showChangeBox, setShowChangeBox] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!submission) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-4xl mb-4">📄</p>
            <h1 className="text-xl font-bold text-slate-900">Submission not found</h1>
            <Link to="/publishing" className="text-teal-600 font-medium text-sm mt-3 inline-block">
              ← Back to Publishing Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const actor = { id: user.id, name: user.name, systemRole: effectiveRole(user) };
  const actions = (ACTIONS_BY_STATUS[submission.status] || []).filter((action) => {
    const roleOk = hasRole(user, action.roles);
    const ownerOk = !action.isAuthorOnly || user.id === submission.authorId || effectiveRole(user) === ROLES.ADMINISTRATOR;
    return roleOk && ownerOk;
  });

  function runAction(action) {
    if (action.needsComment && !showChangeBox) {
      setShowChangeBox(true);
      return;
    }
    if (action.needsComment && !changeComment.trim()) {
      toast?.addToast('Please explain what needs to change.', 'error');
      return;
    }

    setBusy(true);
    setTimeout(() => {
      let updated = null;
      if (action.key === 'submit') updated = publishingService.submitForReview(submission.id, actor);
      if (action.key === 'startReview') updated = publishingService.startReview(submission.id, actor);
      if (action.key === 'requestChanges') updated = publishingService.requestChanges(submission.id, actor, changeComment.trim());
      if (action.key === 'approve') updated = publishingService.approve(submission.id, actor);
      if (action.key === 'publish') updated = publishingService.publish(submission.id, actor);

      setBusy(false);
      setShowChangeBox(false);
      setChangeComment('');

      if (updated) {
        setSubmission(updated);
        toast?.addToast(`"${updated.title}" is now ${STATUS_LABELS[updated.status]}.`, 'success');
      }
    }, 350);
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const updated = publishingService.addComment(submission.id, actor, commentText);
    if (updated) {
      setSubmission(updated);
      setCommentText('');
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
        <button onClick={() => navigate('/publishing')} className="inline-block text-sm text-teal-600 hover:text-teal-700 mb-6">
          ← Back to Publishing Studio
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{submission.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              by {submission.authorName} · {submission.category} · {submission.language} · {submission.level}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${STATUS_BADGE_CLASSES[submission.status]}`}>
            {STATUS_LABELS[submission.status]}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* CONTENT PREVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-sm mb-3">Content</h2>
              <div className="space-y-3">
                {submission.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-slate-700 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            {actions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-sm mb-3">Actions</h2>

                {showChangeBox && (
                  <textarea
                    value={changeComment}
                    onChange={(e) => setChangeComment(e.target.value)}
                    placeholder="What needs to change?"
                    rows={3}
                    className="w-full mb-3 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                )}

                <div className="flex flex-wrap gap-3">
                  {actions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => runAction(action)}
                      disabled={busy}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${ACTION_STYLES[action.key]}`}
                    >
                      {busy ? 'Working…' : action.needsComment && showChangeBox ? 'Confirm — Send Back' : action.label}
                    </button>
                  ))}
                  {showChangeBox && (
                    <button
                      onClick={() => { setShowChangeBox(false); setChangeComment(''); }}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* COMMENTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-sm mb-3">
                Comments <span className="font-normal text-slate-400">({submission.comments.length})</span>
              </h2>
              <div className="space-y-3 mb-4">
                {submission.comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-slate-700">{c.byName}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(c.at).toLocaleString()}</p>
                  </div>
                ))}
                {submission.comments.length === 0 && (
                  <p className="text-sm text-slate-400">No comments yet.</p>
                )}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold">
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Approval History</h2>
            <StatusTimeline status={submission.status} history={submission.history} />
          </div>
        </div>
      </div>
    </div>
  );
}
