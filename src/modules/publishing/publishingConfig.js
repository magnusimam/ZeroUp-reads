import { ROLES } from '../../config/roles';

// Exact stage order from the brief: Draft → Submitted → Review →
// Needs Changes → Approved → Published. A "needs_changes" submission goes
// back through Submitted/Review on resubmit rather than being a dead end.
export const STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEW: 'review',
  NEEDS_CHANGES: 'needs_changes',
  APPROVED: 'approved',
  PUBLISHED: 'published',
};

export const STATUS_ORDER = [
  STATUS.DRAFT, STATUS.SUBMITTED, STATUS.REVIEW, STATUS.NEEDS_CHANGES, STATUS.APPROVED, STATUS.PUBLISHED,
];

export const STATUS_LABELS = {
  [STATUS.DRAFT]: 'Draft',
  [STATUS.SUBMITTED]: 'Submitted',
  [STATUS.REVIEW]: 'In Review',
  [STATUS.NEEDS_CHANGES]: 'Needs Changes',
  [STATUS.APPROVED]: 'Approved',
  [STATUS.PUBLISHED]: 'Published',
};

export const STATUS_BADGE_CLASSES = {
  [STATUS.DRAFT]: 'bg-slate-100 text-slate-600',
  [STATUS.SUBMITTED]: 'bg-sky-100 text-sky-700',
  [STATUS.REVIEW]: 'bg-amber-100 text-amber-700',
  [STATUS.NEEDS_CHANGES]: 'bg-red-100 text-red-600',
  [STATUS.APPROVED]: 'bg-teal-100 text-teal-700',
  [STATUS.PUBLISHED]: 'bg-emerald-100 text-emerald-700',
};

// Which action buttons render for which status+role combination — a lookup
// table (Rules Engine principle) instead of per-button `if` chains scattered
// through SubmissionDetailPage's JSX. "Reviewer" from the brief's pipeline
// diagram is performed by Editor/Administrator (see roles.js's note).
const REVIEWER_ROLES = [ROLES.EDITOR, ROLES.ADMINISTRATOR];
const PUBLISHER_ROLES = [ROLES.PUBLISHER, ROLES.ADMINISTRATOR];

export const ACTIONS_BY_STATUS = {
  [STATUS.DRAFT]: [
    { key: 'submit', label: 'Submit for Review', roles: [ROLES.AUTHOR, ROLES.TRANSLATOR, ROLES.ADMINISTRATOR], isAuthorOnly: true },
  ],
  [STATUS.SUBMITTED]: [
    { key: 'startReview', label: 'Start Review', roles: REVIEWER_ROLES },
  ],
  [STATUS.REVIEW]: [
    { key: 'requestChanges', label: 'Request Changes', roles: REVIEWER_ROLES, needsComment: true },
    { key: 'approve', label: 'Approve', roles: REVIEWER_ROLES },
  ],
  [STATUS.NEEDS_CHANGES]: [
    { key: 'submit', label: 'Resubmit for Review', roles: [ROLES.AUTHOR, ROLES.TRANSLATOR, ROLES.ADMINISTRATOR], isAuthorOnly: true },
  ],
  [STATUS.APPROVED]: [
    { key: 'publish', label: 'Publish', roles: PUBLISHER_ROLES },
  ],
  [STATUS.PUBLISHED]: [],
};
