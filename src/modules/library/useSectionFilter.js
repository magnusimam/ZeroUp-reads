import { useState } from 'react';

// Dropdown-filter-by-one-field pattern (AllBooksSection's topic picker):
// open/select state plus the filtered list. Slicing/sorting the result stays
// in the component.
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
