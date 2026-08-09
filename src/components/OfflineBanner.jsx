import { useEffect } from 'react';
import useOnlineStatus from '../modules/reading/useOnlineStatus';
import * as eventBus from '../utils/eventBus';
import { useToast } from '../context/ToastContext';

// App-wide "you're offline" indicator — persistent (not a toast, since it
// should stay up for the whole offline duration) — plus the reconnect side
// of syncService.js's outbox: the moment the browser comes back online and
// syncService flushes, this shows the confirmation toast.
export default function OfflineBanner() {
  const online = useOnlineStatus();
  const toast = useToast();

  useEffect(() => (
    eventBus.on('sync.completed', () => {
      toast?.addToast('Reading progress synced ✓', 'success');
    })
  ), [toast]);

  if (online) return null;

  return (
    <div
      role="status"
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--hero-ink, #3A1A10)', color: 'white',
        textAlign: 'center', padding: '8px 16px',
        fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
      }}
    >
      📶 You're offline — showing downloaded books only. We'll sync your progress once you're back online.
    </div>
  );
}
