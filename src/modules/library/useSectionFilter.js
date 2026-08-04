import { useState } from 'react';

// Shared dropdown-filter-by-one-field pattern used by StoryBooksSection and
// EducationalBooksSection — same open/select/filter behavior, just a
// different field and option list per section. Slicing/composition of the
// filtered list (e.g. featured + small-list split) stays in each component,
// since that part genuinely differs between sections.
export default function useSectionFilter(books, getFieldValue) {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const filtered = selected ? books.filter((book) => getFieldValue(book) === selected) : books;

  function select(value) {
    setSelected(value);
    setOpen(false);
  }

  return { selected, open, setOpen, select, filtered };
}
