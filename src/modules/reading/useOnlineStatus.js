import { useEffect, useState } from 'react';

// Tiny wrapper over navigator.onLine + the online/offline window events —
// shared by ReadingPage (prefer the offline cache when offline), the app-wide
// offline banner, and DownloadButton.
export default function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() { setOnline(true); }
    function handleOffline() { setOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
