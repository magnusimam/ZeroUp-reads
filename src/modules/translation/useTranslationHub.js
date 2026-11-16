import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as translationRequestService from '../books/translationRequestService';
import * as translationService from './translationService';
import { ROLES, hasRole } from '../../config/roles';

// Data for the Translation Workspace hub (/translator): requests an admin has
// accepted, the signed-in translator's own drafts, and — for reviewers —
// everything waiting on review.
export default function useTranslationHub() {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([translationRequestService.getOpenRequests(), translationService.getDrafts()]).then(([requests, allDrafts]) => {
      if (cancelled) return;
      setOpenRequests(requests);
      setDrafts(allDrafts);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const isReviewer = hasRole(user, [ROLES.EDITOR, ROLES.ADMINISTRATOR]);
  const myDrafts = drafts.filter((d) => d.translatorId === user.id);
  const reviewQueue = drafts.filter((d) => d.status === 'submitted' && d.translatorId !== user.id);

  return { loading, openRequests, myDrafts, reviewQueue, isReviewer };
}
