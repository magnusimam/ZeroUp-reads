import { useState } from 'react';
import { BOOK_CATEGORIES } from '../../utils/mockData';
import * as booksService from '../books/booksService';

const EMPTY_FORM = {
  title: "",
  author: "",
  language: "English",
  level: "Beginner",
  category: BOOK_CATEGORIES[0],
  content: "",
};

// Upload/delete/translate state, validation, and the translate stub —
// extracted out of AdminCMSPage's JSX so the page stays presentational
// (mirrors how useLibraryFilters extracted LibraryPage's filter logic).
// Create/update/delete route through booksService's real-API-aware
// createBookAsAdmin/deleteBookAsAdmin (Stage 12) when realBooksApi + a
// signed-in Administrator token are both present, falling back to the local
// mock otherwise — this hook doesn't need to know which.
export default function useBookUpload() {
  const [books, setBooks] = useState(() => booksService.getBooks());
  const [showForm, setShowForm] = useState(false);
  const [successMSG, setSuccessMSG] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [translateModal, setTranslateModal] = useState(null);
  const [translateLang, setTranslateLang] = useState("");
  const [translating, setTranslating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Edit flow (Stage 14 — BookVersions is only meaningful once edits can
  // actually happen from the UI; there was no Edit action before this).
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  // Version history panel — fetched on demand per book, not kept for every
  // row up front.
  const [historyBook, setHistoryBook] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoring, setRestoring] = useState(false);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openEdit(book) {
    setEditingBook(book);
    setEditError("");
    setEditForm({
      title: book.title,
      author: book.author,
      language: book.language,
      level: book.level,
      category: book.category,
      content: Array.isArray(book.content) ? book.content.join('\n\n') : (book.content || ''),
    });
  }

  function closeEdit() {
    setEditingBook(null);
  }

  function handleEditFormChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setEditError("");

    if (!editForm.title || !editForm.author || !editForm.content) {
      setEditError("Please fill in title, author, and content.");
      return;
    }

    const result = await booksService.updateBookAsAdmin(editingBook.id, {
      title: editForm.title,
      author: editForm.author,
      language: editForm.language,
      level: editForm.level,
      category: editForm.category,
      content: [editForm.content],
    });

    if (!result.success) {
      setEditError(result.message || "Could not update the book. Please try again.");
      return;
    }

    setBooks(booksService.getBooks());
    setEditingBook(null);
    setSuccessMSG("Book updated successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  async function openHistory(book) {
    setHistoryBook(book);
    setLoadingVersions(true);
    setVersions(await booksService.getBookVersions(book.id));
    setLoadingVersions(false);
  }

  function closeHistory() {
    setHistoryBook(null);
    setVersions([]);
  }

  async function handleRestore(versionNumber) {
    setRestoring(true);
    const result = await booksService.restoreBookVersion(historyBook.id, versionNumber);
    setRestoring(false);

    if (!result.success) {
      setFormError(result.message || "Could not restore that version.");
      return;
    }

    setBooks(booksService.getBooks());
    closeHistory();
    setSuccessMSG("Book restored to the selected version!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.author || !form.content) {
      setFormError("Please fill in title, author, and content.");
      return;
    }

    const result = await booksService.createBookAsAdmin({
      title: form.title,
      author: form.author,
      language: form.language,
      level: form.level,
      category: form.category,
      content: [form.content],
    });

    if (!result.success) {
      setFormError(result.message || "Could not upload the book. Please try again.");
      return;
    }

    setBooks(booksService.getBooks());
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSuccessMSG("Book uploaded successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  async function handleDelete(id) {
    const result = await booksService.deleteBookAsAdmin(id);
    setDeleteConfirm(null);

    if (!result.success) {
      setFormError(result.message || "Could not delete the book. Please try again.");
      return;
    }

    setBooks(result.books);
    setSuccessMSG("Book deleted successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  function handleTranslate() {
    if (!translateLang) return;
    setTranslating(true);
    // stub - real Cloudflare Api goes here later
    setTimeout(() => {
      booksService.translateBook(translateModal, translateLang);
      setBooks(booksService.getBooks());
      setTranslating(false);
      setTranslateModal(null);
      setTranslateLang("");
      setSuccessMSG(`Book translated to ${translateLang} and added to library! `);
      setTimeout(() => setSuccessMSG(""), 4000);
    }, 2000);
  }

  return {
    books, setBooks,
    showForm, setShowForm,
    successMSG,
    deleteConfirm, setDeleteConfirm,
    translateModal, setTranslateModal,
    translateLang, setTranslateLang,
    translating,
    form,
    formError,
    handleFormChange,
    handleUpload,
    handleDelete,
    handleTranslate,
    editingBook, openEdit, closeEdit,
    editForm, editError, handleEditFormChange, handleUpdate,
    historyBook, versions, loadingVersions, restoring,
    openHistory, closeHistory, handleRestore,
  };
}
