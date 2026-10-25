import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as booksService from '../books/booksService';
import { BOOK_LEVELS } from '../../utils/mockData';
import { preferCoveredBooks, sortBooks } from './libraryConfig';
import {
  AUDIENCE_TABS, PARENT_SHELVES, PARENT_SHELF_SIZE, TEACHER_SUBJECTS, matchesShelf,
} from './parentsTeachersConfig';

// Parents & Teachers page state (Separation of Concerns — the page and its
// tabs stay presentational). The active tab lives in the URL (?tab=teachers)
// so the Library cards and the Explore menu can link straight to a tab.
export default function useParentsTeachers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = AUDIENCE_TABS.some(t => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'parents';

  // Originals only — hand-translated copies (attributes.translatedFrom) would
  // otherwise show the same story twice.
  const books = useMemo(() => booksService.getBooks().filter(b => !b.attributes?.translatedFrom), []);

  const parentShelves = useMemo(
    () => PARENT_SHELVES
      .map(shelf => ({
        ...shelf,
        books: sortBooks(preferCoveredBooks(books.filter(b => matchesShelf(b, shelf))), 'reads').slice(0, PARENT_SHELF_SIZE),
      }))
      .filter(shelf => shelf.books.length > 0),
    [books],
  );

  const subjects = useMemo(
    () => TEACHER_SUBJECTS.filter(s => books.some(b => s.categories.includes(b.category))),
    [books],
  );
  const levels = useMemo(() => BOOK_LEVELS.filter(l => books.some(b => b.level === l)), [books]);

  const [subjectId, setSubjectId] = useState(null);
  const [level, setLevel] = useState(null);
  const subject = subjects.find(s => s.id === subjectId) || null;

  const teacherBooks = useMemo(() => {
    const matches = books.filter(b => (!subject || subject.categories.includes(b.category)) && (!level || b.level === level));
    return sortBooks(matches, 'rating');
  }, [books, subject, level]);

  function setTab(id) {
    setSearchParams(id === 'parents' ? {} : { tab: id }, { replace: true });
  }

  return {
    tab, setTab,
    parentShelves,
    subjects, subjectId: subject?.id || null, setSubjectId,
    levels, level, setLevel,
    teacherBooks,
    clearTeacherFilters: () => { setSubjectId(null); setLevel(null); },
  };
}
