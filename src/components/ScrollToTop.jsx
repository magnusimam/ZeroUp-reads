import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation the way a full
// page load does, so clicking through to a new page (e.g. a book's detail
// page) from partway down a long list left the new page rendered already
// scrolled to that same pixel offset — sometimes as far down as its own
// "You May Also Like" section. Reset to the top on every route change so
// every page always opens at its own beginning.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
