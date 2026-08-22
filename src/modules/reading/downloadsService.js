import * as eventBus from '../../utils/eventBus';
import { getToken } from '../auth/authService';
import { isFeatureEnabled } from '../../config/featureFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function realApiEnabled() {
  return isFeatureEnabled('realDownloadTrackingApi') && Boolean(API_BASE_URL) && Boolean(getToken());
}

// A best-effort analytics mirror of the pre-existing, local-only "save for
// offline reading" feature (offlineService.js) — not a replacement for it;
// offline availability must keep working with no backend at all. Every real
// download already emits `book.downloaded` (offlineService.downloadBook()
// and useBookDetail's legacy .txt export both do), so subscribing here needs
// no changes at either call site (Event-Driven Architecture).
eventBus.on('book.downloaded', ({ id }) => {
  if (!realApiEnabled() || !id) return;
  fetch(`${API_BASE_URL}/downloads/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  }).catch((err) => {
    console.error('Failed to record download with the real API.', err);
  });
});
