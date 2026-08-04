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

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleUpload(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.author || !form.content) {
      setFormError("Please fill in title, author, and content.");
      return;
    }

    booksService.createBook({
      title: form.title,
      author: form.author,
      language: form.language,
      level: form.level,
      category: form.category,
      content: [form.content],
    });
    setBooks(booksService.getBooks());
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSuccessMSG("Book uploaded successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  function handleDelete(id) {
    setBooks(booksService.deleteBook(id));
    setDeleteConfirm(null);
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
    books,
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
  };
}
