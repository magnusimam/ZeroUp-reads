import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// How long to keep looking for a #hash target that renders a moment after
// navigation (e.g. sections that appear once data/filters settle).
const HASH_SCROLL_TIMEOUT_MS = 1500;
const HASH_SCROLL_RETRY_MS = 100;

// React Router doesn't reset scroll position on navigation the way a full
// page load does, so clicking through to a new page (e.g. a book's detail
// page) from partway down a long list left the new page rendered already
// scrolled to that same pixel offset — sometimes as far down as its own
// "You May Also Like" section. Reset to the top on every route change so
// every page always opens at its own beginning — unless the link names a
// section (#hash), in which case scroll to that section instead (React
// Router doesn't do that on its own either).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const id = decodeURIComponent(hash.slice(1));
    const started = Date.now();
    let timer;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (Date.now() - started < HASH_SCROLL_TIMEOUT_MS) {
        timer = setTimeout(tryScroll, HASH_SCROLL_RETRY_MS);
      }
    };
    tryScroll();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
